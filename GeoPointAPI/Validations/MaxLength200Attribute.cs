using System.ComponentModel.DataAnnotations;

namespace GeoPointAPI.Validation
{
    public class MaxLength200Attribute : ValidationAttribute
    {
        public override bool IsValid(object? value)
        {
            if (value is string str)
                return str.Length <= 200;
            return true;
        }
    }
}
