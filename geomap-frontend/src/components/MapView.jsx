import React, { useRef, useEffect, useState, useMemo } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import WKT from 'ol/format/WKT';
import Feature from 'ol/Feature';
import Draw from 'ol/interaction/Draw';
import { useCallback } from 'react';
import { fromLonLat } from 'ol/proj';
import {  Stroke, Style,Icon } from 'ol/style';
import { Fill } from 'ol/style';
import { Modify } from 'ol/interaction';
import { Polygon } from 'ol/geom';


const MapView = () => {
  const mapRef = useRef();
  const olMapRef = useRef(); 
  const modifyRef = useRef(null);

  const [selectedFeature, setSelectedFeature] = useState(null);
  const [points, setPoints] = useState([]);
  
  const [newPointName, setNewPointName] = useState('');
  const[showPointsList, setShowPointsList]=useState(false);
  const [drawType, setDrawType] = useState('Point');
  const [showLinesList, setShowLinesList] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showPolygonsList, setShowPolygonsList] = useState(false);
  const [unsavedFeature, setUnsavedFeature] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const vectorSourceRef = useRef(new VectorSource());
  const wktFormat = useMemo(() => new WKT(), []);
  
   
    

  const getPoints = useCallback(async () => {
    const url = "https://localhost:7297/api/point";
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      const result = await response.json();
      setPoints(result.data);
      return result.data;
    } catch (error) {
      console.error("Error fetching points:", error.message);
      return [];
    }
  }, []);
  
  
    const handleCreate=async()=> {
    if (!selectedFeature){
        alert('No feature selected! Complete your drawing first.');
      return;
      } 
      
      const fixedGeometry = selectedFeature.getGeometry();
      let geometry = fixedGeometry.clone();

      
      geometry.transform('EPSG:3857', 'EPSG:4326');
      const geometryType = geometry.getType();

  
    const coords = geometry.getCoordinates();
   const isValid =
  (geometryType === 'Point') ||
  (geometryType === 'LineString' && coords.length >= 2) ||
  (geometryType === 'Polygon' && coords[0]?.length >= 4);
    

    if (!isValid) {
      alert(`Incomplete ${geometryType}. Please complete the shape before saving.`);
      return;
    }

    const wkt = wktFormat.writeGeometry(geometry);

       
    try {
      const response= await fetch("https://localhost:7297/api/point",{
        method:'POST',
        headers:{
          'Content-Type': 'application/json',
        },
         body: JSON.stringify({
        Name: newPointName || `Untitled ${drawType}`,
        WKT: wkt,
        GeometryType: geometryType
      })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server error response:", errorText);
        throw new Error(`HTTP Error: ${response.status}`);
       }
      const result = await response.json();
      console.log('Server response:', result); 

      if (result.data?.id) {
      selectedFeature.setId(result.data.id);
      selectedFeature.set('name', result.data.name);
      
     
      await loadPoints();

      alert(`${drawType} created successfully!`);
      }
     
    } catch (error) {
     console.error("Error creating feature:", error);
     alert(`Error creating ${drawType}: ${error.message}`);
    }
    toggleDrawing(false);

  };
  const getDrawStyle = (type) => {
  if (type === 'Point') {
    return new Style({
      image: new Icon({
        src: 'icons8-map-pin-32.png',
        anchor: [0.5, 1],
        scale: 0.7,
      }),
    });
  } else if (type === 'LineString') {
    return new Style({
      stroke: new Stroke({
        color: '#FF5733',
        width: 3,
      }),
    });
  } else if (type === 'Polygon') {
    return new Style({
      stroke: new Stroke({
        color: '#3399CC',
        width: 2,
      }),
      fill: new Fill({
        color: 'rgba(51, 153, 204, 0.2)',
      }),
    });
  }
};

  const loadPoints = useCallback(async () => {
    const points = await getPoints();

    const features = points.map((point) => {
      const geometry = wktFormat.readGeometry(point.wkt, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857',
      });
    

      const feature = new Feature({
        geometry: geometry,
        name: point.name,
      });
      feature.setId(point.id);

    
    const type = geometry.getType();
    feature.setStyle(getDrawStyle(type));

   

    return feature;
  });

  vectorSourceRef.current.clear();
  vectorSourceRef.current.addFeatures(features);
  if (unsavedFeature) {
  vectorSourceRef.current.addFeature(unsavedFeature);
  }
  setUnsavedFeature(null);
}, [getPoints, wktFormat, unsavedFeature]);




  useEffect(() => {
    if (!mapRef.current) return;

    const map = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({ source: new OSM() }),
        new VectorLayer({ source: vectorSourceRef.current })
      ],
      view: new View({
        center: fromLonLat([37.0, 39.0]),
        zoom: 5.5,
         constrainResolution: true
      }),
    });
    olMapRef.current = map;
    const modify = new Modify({
    source: vectorSourceRef.current,
  });
  modify.setActive(false);
  modifyRef.current = modify;
  map.addInteraction(modify);
    loadPoints();
     
      map.on('click', (evt) => {
      if (isDrawing) return;
      const feature = map.forEachFeatureAtPixel(evt.pixel, (feature) => feature);
      if (feature) {
        setSelectedFeature(feature);
        setNewPointName(feature.get('name') || '');
        
      }
  });

    map.on('pointermove', (e) => {
      const hit = map.hasFeatureAtPixel(e.pixel);
      map.getTargetElement().style.cursor = hit ? 'pointer' : '';
    });

    return () => {
    map.setTarget(null); 
     if (modifyRef.current) {
      olMapRef.current.removeInteraction(modifyRef.current);
    }
  };
}, []);

  const toggleEditing = (enable) => {
    if (!modifyRef.current) return;
    modifyRef.current.setActive(enable);
    setIsEditing(enable);
  };

  const toggleDrawing = (enable, currentDrawType = drawType)=> {
  const map = olMapRef.current;
  if (!map) return;

   map.getInteractions()
    .getArray()
    .filter(i => i instanceof Draw)
    .forEach(i => map.removeInteraction(i));

  

  if (enable) {
    console.log("Creating Draw interaction with type:", currentDrawType);
  const interaction = new Draw({
  source: vectorSourceRef.current,
  type: currentDrawType,
  style: getDrawStyle(currentDrawType),
  finishCondition: () => true, 
});


    interaction.on('drawstart', () => {
      setIsDrawing(true);
        olMapRef.current.getViewport().addEventListener('dblclick', onDoubleClick);
    });

   interaction.on('drawend', (event) => {
  setIsDrawing(false);
  const feature = event.feature;
  const geometry = feature.getGeometry();
  const finalType =  geometry.getType();

  console.log('Original geometry:', geometry.getType(), geometry.getCoordinates());

  if (geometry instanceof Polygon) {
    console.log('✅ This is a Polygon!');
  } else {
    console.log('🚫 Not a Polygon:', geometry.getType());
  }
  
  if (finalType === 'Point') {
    feature.setStyle(
      new Style({
        image: new Icon({
          src: 'icons8-map-pin-32.png',
          anchor: [0.5, 1],
          scale: 0.7,
        }),
      })
    );
  } else if (finalType === 'LineString') {
    const coords = geometry.getCoordinates();
  console.log('🟡 This is a line with', coords.length, 'points');
    feature.setStyle(
      new Style({
        stroke: new Stroke({
          color: '#FF5733',
          width: 3,
        }),
      })
    );
  } else if (finalType === 'Polygon') {
    const coords = geometry.getCoordinates();
    console.log('✅ This is a polygon with', coords[0].length, 'points');
    const ring = coords[0];
    const first = ring[0];
    const last = ring[ring.length - 1];

    if (first[0] !== last[0] || first[1] !== last[1]) {
      ring.push(first);
      geometry.setCoordinates([ring]);
       feature.setGeometry(geometry);
    }
    feature.setStyle(getDrawStyle('Polygon'));
    }

    
console.log("Processed geometry:", geometry.getType(), geometry.getCoordinates());

  
  feature.set('name', newPointName || `Untitled ${drawType}`);
  feature.set('type', finalType);

  setSelectedFeature(feature);
  setUnsavedFeature(feature);
  setNewPointName('');
});

    function onDoubleClick(evt) {
    evt.preventDefault();
    interaction.finishDrawing();
  }
  olMapRef.current.addInteraction(interaction);
    map.addInteraction(interaction);
    interaction.setActive(true);
  }

  setIsDrawing(enable);
};


  const handleUpdate=async()=>{
    if(!selectedFeature) return;

    try{
      
      const geometry = selectedFeature.getGeometry().clone();
      geometry.transform('EPSG:3857', 'EPSG:4326');
      const geometryType = geometry.getType();

      const wkt = wktFormat.writeGeometry(geometry);

      const pointData = {
        name: newPointName || selectedFeature.get('name') || `Unnamed ${geometryType}`,
        wkt: wkt,
        GeometryType: geometryType 
      };
      const response = await fetch(`https://localhost:7297/api/point/${selectedFeature.getId()}`,{
        method:'PUT',
        headers:{
          'Content-Type': 'application/json',
        },
      
      body: JSON.stringify(pointData)
  });
    if(!response.ok){
      throw new Error(`HTTP Error: ${response.status}`);
  }
    await loadPoints();
    toggleEditing(false);
    alert('Feature updated successfully!');
    }
    catch(error){
      console.error('Error updating point:', error);
    alert('Failed to update feature.');
    }

  };
  const handleDelete = async () => {
    if (!selectedFeature) return;
    
    try {
      const response = await fetch(`https://localhost:7297/api/point/${selectedFeature.getId()}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      vectorSourceRef.current.removeFeature(selectedFeature);
      
      await loadPoints(); 
      setSelectedFeature(null);
      setUnsavedFeature(null);
      setNewPointName('');
    } 
    catch (error) {
      console.error("Error deleting point:", error);
    }
  };
  
  const formatCoordinates = (geometry) => {
  try {
    if (!geometry) return "No geometry available";
    
    console.log("Original geometry:", geometry.getType(), geometry.getCoordinates());
    
   
    const geo = geometry.clone();
    
    try {
      
      geo.transform('EPSG:3857', 'EPSG:4326');
    } catch (transformError) {
      console.log("Transform not needed or failed, using original coordinates");
    }
    
    const type = geo.getType();
    const coords = geo.getCoordinates();
    
    console.log("Processed geometry:", type, coords);
    
    if (type === 'Point') {
      const [lon, lat] = coords;
      return `Lat: ${lat.toFixed(6)}°N, Lon: ${lon.toFixed(6)}°E`;
    }
    else if (type === 'LineString') {
      return coords.map(([lon, lat], i) => 
        `Point ${i+1}: ${lat.toFixed(6)}°N, ${lon.toFixed(6)}°E`
      ).join(' | ');
    }
    else if (type === 'Polygon') {
  return coords[0].map(([lon, lat], i) => 
    `Vertex ${i+1}: ${lat.toFixed(6)}°N, ${lon.toFixed(6)}°E`
  ).join(' | ');
}
    
    return `Coordinates: ${JSON.stringify(coords)}`;
    
  } catch (error) {
    console.error("Error formatting coordinates:", error);
    try {
      return `Raw Coordinates: ${JSON.stringify(geometry.getCoordinates())}`;
    } catch (e) {
      return "Coordinates unavailable";
    }
  }
};

   return (
  <div>
    <div ref={mapRef} style={{ width: '100%', height: '400px' }}></div>
    <div style={{ margin: '10px 0' }}>
      
      <button onClick={() => toggleDrawing(true,drawType)} style={{ marginLeft: '10px' }}>
        Add {drawType}
      </button>
      <button onClick={() => toggleDrawing(false)} style={{ marginLeft: '5px' }}>
        Cancel Drawing
      </button>
      <button 
        onClick={() => setShowPointsList(!showPointsList)}
        style={{ marginLeft: '5px' }}
      >
        {showPointsList ? 'Hide Points' : 'Show All Points'}
      </button>
      <button
          onClick={() => setShowLinesList(!showLinesList)}
          style={{ marginLeft: '5px' }}
        >
          {showLinesList ? 'Hide Lines' : 'Show All Lines'}
        </button>
        <button
          onClick={() => setShowPolygonsList(!showPolygonsList)}
          style={{ marginLeft: '5px' }}
        >
  {showPolygonsList ? 'Hide Polygons' : 'Show All Polygons'}
</button>
      <label style={{ marginRight: '5px' }}>Draw Type:</label>
            <select
              value={drawType}
              onChange={(e) => {
                setDrawType(e.target.value);
                toggleDrawing(false);
              }}
              style={{ marginRight: '10px' }}
            >
              <option value="Point">Point</option>
              <option value="LineString">Line</option>
              <option value="Polygon">Polygon</option>
            </select>
    </div>

    {showPointsList && (
      <div style={{
        margin: '10px 0',
        padding: '10px',
        border: '1px solid #ccc',
        maxHeight: '200px',
        overflowY: 'auto'
      }}>
        <h3>All Points ({points.length})</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {points.map((point) => (
            <li 
              key={point.id}
              style={{
                padding: '5px',
                backgroundColor: selectedFeature?.getId() === point.id ? '#f0f0f0' : 'transparent'
              }}
              onClick={() => {
                const map = olMapRef.current;
                if (map) {
                  const vectorLayer = map.getLayers().getArray()[1];
                  const feature = vectorLayer.getSource().getFeatures()
                    .find(f => f.getId() === point.id);
                  if (feature) {
                    setSelectedFeature(feature);
                    setNewPointName(point.name);
                  }
                }
              }}
            >
              {point.name || `Point ${point.id}`}
            </li>
          ))}
        </ul>
      </div>
    )}
    {showLinesList && (
  <div style={{
    margin: '10px 0',
    padding: '10px',
    border: '1px solid #ccc',
    maxHeight: '200px',
    overflowY: 'auto'
  }}>
    <h3>All Lines</h3>
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {points
        .filter((point) => {
          const geometry = wktFormat.readGeometry(point.wkt);
          return geometry.getType() === 'LineString';
        })
        .map((line) => (
          <li
            key={line.id}
            style={{
              padding: '5px',
              backgroundColor: selectedFeature?.getId() === line.id ? '#f0f0f0' : 'transparent'
            }}
            onClick={() => {
              const map = olMapRef.current;
              if (map) {
                const vectorLayer = map.getLayers().getArray()[1];
                const feature = vectorLayer.getSource().getFeatures()
                  .find(f => f.getId() === line.id);
                if (feature) {
                  setSelectedFeature(feature);
                  setNewPointName(line.name);
                }
              }
            }}
          >
            {line.name || `Line ${line.id}`}
          </li>
        ))}
    </ul>
  </div>
)}
{showPolygonsList && (
  <div style={{
    margin: '10px 0',
    padding: '10px',
    border: '1px solid #ccc',
    maxHeight: '200px',
    overflowY: 'auto'
  }}>
    <h3>All Polygons</h3>
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {points
        .filter((point) => {
          const geometry = wktFormat.readGeometry(point.wkt);
          return geometry.getType() === 'Polygon';
        })
        .map((polygon) => (
          <li
            key={polygon.id}
            style={{
              padding: '5px',
              backgroundColor: selectedFeature?.getId() === polygon.id ? '#f0f0f0' : 'transparent'
            }}
            onClick={() => {
              const map = olMapRef.current;
              if (map) {
                const vectorLayer = map.getLayers().getArray()[1];
                const feature = vectorLayer.getSource().getFeatures()
                  .find(f => f.getId() === polygon.id);
                if (feature) {
                  setSelectedFeature(feature);
                  setNewPointName(polygon.name);
                }
              }
            }}
          >
            {polygon.name || `Polygon ${polygon.id}`}
          </li>
        ))}
    </ul>
  </div>
)}

  {selectedFeature && (
  <div style={{ margin: '10px 0' }}>
    <h3>{drawType} Details</h3>
    <div>
      <label>Name: </label>
      <input
        type="text"
        value={newPointName}
        onChange={(e) => setNewPointName(e.target.value)}
        placeholder={`Enter ${drawType} name`}
      />
    </div>
    <p>Coordinates: {formatCoordinates(selectedFeature.getGeometry())}</p>
    <div style={{ marginTop: '10px' }}>
      {selectedFeature.getId() ? (
        !isEditing ? (
          <>
            <button
              onClick={() => toggleEditing(true)}
              style={{ marginRight: '5px' }}
            >
              Edit Geometry
            </button>
            <button onClick={handleDelete}>Delete {drawType}</button>
          </>
        ) : (
          <>
            <button
              onClick={handleUpdate}
              style={{ marginRight: '5px' }}
            >
              Save Changes
            </button>
            <button onClick={() => toggleEditing(false)}>
              Cancel Editing
            </button>
          </>
        )
      ) : (
        <button onClick={handleCreate}>
          Save New {drawType}
        </button>
      )}
    </div>
  </div>
)}
  </div>
);};
export default MapView;