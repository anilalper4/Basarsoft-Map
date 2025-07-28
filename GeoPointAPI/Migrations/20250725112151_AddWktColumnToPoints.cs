using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GeoPointAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddWktColumnToPoints : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Wkt",
                table: "Points",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Wkt",
                table: "Points");
        }
    }
}
