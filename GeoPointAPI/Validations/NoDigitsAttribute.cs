using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;

namespace GeoPointAPI.Validation
{
    public class NoDigitsAttribute : ValidationAttribute
    {
        public override bool IsValid(object? value)
        {
            if (value is string str)
                return Regex.IsMatch(str, @"^[\p{L}\s]+$");
            return true;
        }
    }
}