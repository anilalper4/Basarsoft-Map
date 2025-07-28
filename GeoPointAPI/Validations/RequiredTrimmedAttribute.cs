using System.ComponentModel.DataAnnotations;

namespace GeoPointAPI.Validation
{
    public class RequiredTrimmedAttribute : ValidationAttribute
    {
        public override bool IsValid(object? value)
        {
            if (value is string str)
                return !string.IsNullOrWhiteSpace(str);
            return false;
        }
    }
}
