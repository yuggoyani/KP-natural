import { GujaratLocationOption } from "@/types/checkout";

/**
 * Development Gujarat Location Dataset
 * NOTE: This is structured for dynamic Supabase database query replacement.
 * In production, districts, areas, and valid PIN codes will be fetched from Supabase.
 */
export const GUJARAT_LOCATIONS: GujaratLocationOption[] = [
  {
    district: "Surat",
    areas: [
      { name: "Katargam (Causeway Road)", pinCode: "395004" },
      { name: "Adajan / Pal", pinCode: "395009" },
      { name: "Varachha", pinCode: "395006" },
      { name: "Vesu / VIP Road", pinCode: "395007" },
      { name: "Rander", pinCode: "395005" },
      { name: "Piplod", pinCode: "395007" },
      { name: "Kamrej", pinCode: "394185" },
      { name: "Bardoli", pinCode: "394601" },
      { name: "Palsana", pinCode: "394315" },
      { name: "Olpad", pinCode: "394540" },
    ],
  },
  {
    district: "Ahmedabad",
    areas: [
      { name: "Navrangpura", pinCode: "380009" },
      { name: "Satellite / Vastrapur", pinCode: "380015" },
      { name: "Bopal / South Bopal", pinCode: "380058" },
      { name: "Maninagar", pinCode: "380008" },
      { name: "Chandkheda", pinCode: "382424" },
      { name: "Naroda / Nikol", pinCode: "382330" },
      { name: "Gota / SG Highway", pinCode: "382481" },
      { name: "Sanand", pinCode: "382110" },
    ],
  },
  {
    district: "Vadodara",
    areas: [
      { name: "Alkapuri", pinCode: "390007" },
      { name: "Gotri / Vasna Road", pinCode: "390021" },
      { name: "Manjalpur", pinCode: "390011" },
      { name: "Karelibaug", pinCode: "390018" },
      { name: "Fatehgunj", pinCode: "390002" },
      { name: "Sayajigunj", pinCode: "390005" },
      { name: "Waghodia Road", pinCode: "390019" },
    ],
  },
  {
    district: "Rajkot",
    areas: [
      { name: "Kalawad Road", pinCode: "360005" },
      { name: "University Road", pinCode: "360005" },
      { name: "Yagnik Road", pinCode: "360001" },
      { name: "Mavdi", pinCode: "360004" },
      { name: "Kothariya Road", pinCode: "360022" },
      { name: "Gondal", pinCode: "360311" },
    ],
  },
  {
    district: "Gandhinagar",
    areas: [
      { name: "Sector 1 to 30", pinCode: "382010" },
      { name: "Infocity / Kudasan", pinCode: "382421" },
      { name: "Randesan / Raysan", pinCode: "382426" },
      { name: "Kalol", pinCode: "382721" },
      { name: "Mansa", pinCode: "382845" },
    ],
  },
  {
    district: "Bhavnagar",
    areas: [
      { name: "Kalanala / Waghawadi", pinCode: "364001" },
      { name: "Ghogha Road", pinCode: "364002" },
      { name: "Sihor", pinCode: "364240" },
      { name: "Talaja", pinCode: "364140" },
      { name: "Mahuva", pinCode: "364290" },
    ],
  },
  {
    district: "Navsari",
    areas: [
      { name: "Station Road / Lunsikui", pinCode: "396445" },
      { name: "Jalalpore", pinCode: "396421" },
      { name: "Gandevi", pinCode: "396360" },
      { name: "Bilimora", pinCode: "396321" },
    ],
  },
  {
    district: "Valsad",
    areas: [
      { name: "Tithal Road", pinCode: "396001" },
      { name: "Vapi (GIDC / Town)", pinCode: "396195" },
      { name: "Pardi", pinCode: "396125" },
      { name: "Dharampur", pinCode: "396050" },
      { name: "Umbergaon", pinCode: "396170" },
    ],
  },
  {
    district: "Bharuch",
    areas: [
      { name: "Station Road / Zadeshwar", pinCode: "392001" },
      { name: "Ankleshwar GIDC", pinCode: "393002" },
      { name: "Dahej", pinCode: "392130" },
      { name: "Jambusar", pinCode: "392150" },
    ],
  },
  {
    district: "Anand",
    areas: [
      { name: "Anand Town", pinCode: "388001" },
      { name: "Vallabh Vidyanagar", pinCode: "388120" },
      { name: "Borsad", pinCode: "388540" },
      { name: "Petlad", pinCode: "388450" },
      { name: "Khambhat", pinCode: "388620" },
    ],
  },
  {
    district: "Junagadh",
    areas: [
      { name: "Zanzarda Road", pinCode: "362002" },
      { name: "Joshipura", pinCode: "362001" },
      { name: "Keshod", pinCode: "362220" },
      { name: "Mangrol", pinCode: "362225" },
    ],
  },
  {
    district: "Mehsana",
    areas: [
      { name: "Mehsana City", pinCode: "384002" },
      { name: "Kadi", pinCode: "382715" },
      { name: "Visnagar", pinCode: "384315" },
      { name: "Unjha", pinCode: "384170" },
    ],
  },
];

/**
 * Fetch available Gujarat districts
 * (Ready for future `supabase.from('districts').select('*')`)
 */
export async function getGujaratDistricts(): Promise<string[]> {
  return GUJARAT_LOCATIONS.map((item) => item.district);
}

/**
 * Fetch areas/villages for a given district
 * (Ready for future `supabase.from('areas').select('*').eq('district_id', districtId)`)
 */
export async function getAreasForDistrict(districtName: string): Promise<{ name: string; pinCode: string }[]> {
  const found = GUJARAT_LOCATIONS.find(
    (item) => item.district.toLowerCase() === districtName.toLowerCase()
  );
  return found ? found.areas : [];
}
