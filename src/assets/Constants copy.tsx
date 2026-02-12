/****************************************API method's**************************************/

import { validatePathConfig } from "@react-navigation/native";

//API method
export const APIMethod = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  DELETE: "DELETE",
};
//API url
export const APIURL = {
  BASE: "https://api.bmebharat.com",
  LOGIN: "https://badq1x30ch.execute-api.ap-south-1.amazonaws.com/dev/loginUser",
  SEND_OTP: "https://badq1x30ch.execute-api.ap-south-1.amazonaws.com/dev/singInOTP",
  VERIFY_OTP: "https://badq1x30ch.execute-api.ap-south-1.amazonaws.com/dev/verifyOtpMsg91",
  REGISTER_FORM: " https://badq1x30ch.execute-api.ap-south-1.amazonaws.com/dev/signUpUsers",
  GET_USER: "https://badq1x30ch.execute-api.ap-south-1.amazonaws.com/dev/getUserDetails",
  //company's API 
  CREATE_COMPANY: " https://badq1x30ch.execute-api.ap-south-1.amazonaws.com/dev/createCompanyProfile",
  IMG_FILE: " https://badq1x30ch.execute-api.ap-south-1.amazonaws.com/dev/uploadImageFromUrl",
  UPDATE_COMPANY: " https://badq1x30ch.execute-api.ap-south-1.amazonaws.com/dev/updateCompanyProfile",
  LIST_COMAPNY: ": https://badq1x30ch.execute-api.ap-south-1.amazonaws.com/dev/listCompanies",
  // COMPANY_PRODUCT:"https://badq1x30ch.execute-api.ap-south-1.amazonaws.com/dev/createCompanyProfile",
  CREATE_JOB: " https://badq1x30ch.execute-api.ap-south-1.amazonaws.com/dev/createAJobPost",
  JOB_DETAILS: " https://badq1x30ch.execute-api.ap-south-1.amazonaws.com/dev/getUserAllJobPosts",
};
//API contentype
// export const contentType = {
//   JSON: "application/json",
//   FORM_URLENCODED: "application/x-www-form-urlencoded",
//   FORM_DATA: "multipart/form-data",
// }

export const ContentType = {
  JSON: "application/json",
  FORM_URLENCODED: "application/x-www-form-urlencoded",
  FORM_DATA: "multipart/form-data",

};
/****************************************BME-Bharat(Colors)**************************************/

//BME colors
export const COLORS = {
  // DARKBLUE: "#075cab",
  // LIGHTBLUE: "#6EA8DA",
  // DARKGRAY: "#999",
  // BLACK: "#000",
  // WHITE: "#ffff",
  // PLACEHOLDER: "#84bddb",
  // RED:'red'
  white: '#fff',
  black: '#000',
  blue: '#5D5FEE',
  grey: '#BABBC3',
  light: '#F3F4FB',
  darkBlue: '#075cab',
  red: 'red',
};
/****************************************Images*************************************************/

//export const BME_Logo = require("../images/BME_Logo.png");//BME logo
//export const Dummy_Profile = require("../images/Dummy_Profile.png");//Dummy_Profile logo



/***************************************ErrorString***********************************************/

export const APPSTRING = {

  ERROR: "Error",
  App_Name: "BME India",
  No_Record: "No record found.",

  //Enter_Phone screen
  Required_OTP: "OTP is required.",
  Required_Password: "Password is required.",
  Required_Confirm_Password: "Confirm password is required.",
  Password_Not_Matched: "Password not matched.",
  Invalid_Password_Lenght: "Password must be at least 6 characters",
  Required_Mobile: "Mobile Number is required.",
  Invalid_Email: "Invalid email address",
  Invalid_Phone: "Invalid phone number",

  //Personal_Info screen
  Required_Fullname: "Full Name is required**",

  //Personal_info screen
  Required_Firstname: "First Name is required**.",
  Required_Lastname: "Last Name is required**.",
  Required_Email: "Enter Email ID**",
  Required_Phone_Number: "Enter Phone Number **",
  Required_City: "Enter City**",
  Required_Company_Collage: "Enter Company/Collage**",
  Required_Website: "Enter Website**",

  //ProfileType screen
  Required_Profile: 'Profile is required**',
  Required_Category: 'Category is required**',

  //Buisness_Info screen
  Required_Buisness_Name: 'Company Name is required**',
  Required_Buisness_Email: 'Email is required**',
  Required_Buisness_Mobile: 'Mobile is required**',
  Required_Buisness_RegistrationId: 'Registration Id is required**',
  Required_Buisness_Address: 'Address is required**',
  Required_Buisness_City: 'City is required**',
  Required_Buisness_State: 'State is required**',
  Required_Buisness_Description: 'Description is required**',
  Required_Buisness_BiomedicalExpertise: 'Biomedical Expertise  is required**',
  Required_Buisness_Catalogue: "Catalogue required**",
  Required_Buisness_Brochure: "Brochure required**",

  //Product_Info screen
  Required_Product_Name: 'Name is required**',
  Required_Product_Description: 'Description is required**',
  Required_Product_Model_Name: 'Model Name is required**',
  Required_Product_Specification: 'Specification is required**',
  Required_Product_Category: 'Category is required**',
  Required_Product_Price: 'Price is required**',
};

/***********************************categoryTypes**************************************************/

export const ProfileSelect = {
  // Company Profiles
  companyProfiles: {
    "Biomedical Engineering Company Manufacturer": [
      "Diagnostic Equipment",
      "Wearable Health Tech",
      "Prosthetics and Implants",
      "Medical Devices",
      "Biotechnology Products",
      "Pharmaceuticals",
      "Laboratory Equipment",
      "Imaging Technology"
    ],
    "Dealer/Distributor": [
      "Medical Devices",
      "Laboratory Supplies",
      "Pharmaceuticals",
      "Healthcare IT Solutions",
      "Surgical Instruments",
      "Medical Imaging Devices",
      "Diagnostic Equipment",
      "Implantable Devices",
      "Wearable Health Monitors"
    ],
    "Biomedical Engineering Company - Service Provider": [
      "Equipment Maintainance",
      "Calibration Services",
      "Medical Imaging Services",
      "Biomedical Waste Management",
      "Installation Services",
      "Clinical Engineering Support",
      "Training and Education Services",
      "Telemedicine Services"
    ],
    "Healthcare Provider - Biomedical": [
      "Hospital Biomedical Department",
      "Clinical Lab",
      "Diagnostic Center",
      "Rehabilitation Center",
      "Home Healthcare"
    ],
    "Academic Institution - Biomedical": [
      "Biomedical Engineering Programs",
      "Research Institutions",
      "Training Centers",
      "Internship and Training Provider",
      "Healthcare Education",
      "Continuing Medical Education"
    ],
    "Regulatory Body": [
      "Medical Device Regulations",
      "Biomedical Ethics and Compliance",
      "Biotechnology Regulations",
      "Pharmaceutical Regulations",
      "Clinical Trial Oversight",
      "Quality Assurance"
    ],
    "Investor/Venture Capitalist": [
      "Medical Devices",
      "Biotechnology",
      "Pharmaceuticals",
      "Healthcare Startups",
      "Research and Development Funding"
    ],
    "Patient Advocate": [
      "Patient Education",
      "Patient Rights",
      "Healthcare Access",
      "Chronic Disease Advocacy",
      "Disability Support"
    ],
    "Healthcare IT Developer": [
      "Electronic Health Records (EHR)",
      "Telemedicine Solutions",
      "Healthcare Apps",
      "AI in Healthcare",
      "Data Analytics in Healthcare"
    ]
  },

  // Normal (Individual) Profiles
  normalProfiles: {
    "Biomedical Engineering Student": [
      "Undergraduate Student",
      "Graduate Student",
      "PhD Candidate",
      "Research Intern",
      "Project Collaborator",
    ],
    "Biomedical Engineering Professor/Academic": [
      "Lecturer",
      "Thesis Advisor",
      "Department Head",
      "Laboratory Director",
    ],
    "Biomedical Engineer": [
      "Research & Development Engineer",
      "Clinical Engineer",
      "Product Design Engineer",
      "Quality Assurance Engineer",
      "Regulatory Affairs Specialist",
      "Biomedical Engineer Sales/Service",
    ],
    "Biomedical Researcher/Scientist": [
      "Academic Researcher",
      "Industry Researcher",
      "Clinical Trials",
      "Innovation and Prototyping",
      "Medical Device Innovation",
      "Biomedical Research",
      "Clinical Research",
      "Biotechnology Research",
      "Pharmaceutical Research"
    ],
    "Consultant": [
      "Business Development Consulting",
      "Healthcare IT Consulting",
      "Regulatory Consulting",
      "Product Development Consulting",
      "Market Research Consulting",
      "Clinical Engineering Consulting",
      "Quality Assurance Consulting",
      "Medical Device Consulting"
    ],
    "Medical Professional": [
      "Decision Maker",
      "Doctor - Anaesthetist",
      "Doctor - Cardiologist"
    ],
    "Others": [
      "Others"
    ]
  }
};


export const categoryTypes = [

  { label: 'Pharmaceuticals', value: 'Pharmaceuticals' },
  { label: ' Biomedical_Test_Equipment', value: ' Biomedical Test Equipment' },
  { label: 'Medical_Devices', value: 'Medical Devices' },
  { label: 'Biotechnology', value: 'Biotechnology' },
  { label: 'Healthcare_Services', value: 'Healthcare Services' },
  { label: 'Research_and_Development', value: 'Research and Development' },
  { label: 'Diagnostic_Laboratories', value: 'Diagnostic Laboratories' },
  { label: 'Biomedical_Imaging', value: 'Biomedical Imaging' },
  { label: 'Pharmaceuticals_Distribution', value: 'Pharmaceuticals Distribution' },
  { label: 'Clinical_Research', value: 'Clinical Research' },
  { label: 'Regulatory_Affairs', value: 'Regulatory Affairs' },
  { label: 'Healthcare_Information_Technology', value: 'Healthcare Information Technology' },
  { label: 'Biomedical_Consulting', value: 'Biomedical Consulting' },
  { label: 'Contract_Research_Organizations', value: 'Contract Research Organizations' },
  { label: ' Biomedical_Manufacturing', value: ' Biomedical Manufacturing' },
  { label: 'Pharmaceuticals_Marketing_and_Sales', value: 'Pharmaceuticals Marketing and Sales' },
  { label: 'Biomedical_Ethics_and_Compliance', value: 'Biomedical Ethics and Compliance' },
  { label: 'Biomedical_Education_and_Training', value: 'Biomedical Education and Training' },
  { label: 'Biomedical_Waste_Management', value: 'Biomedical Waste Management' },

];
export const categoryTypes2 = [

  { label: 'PG', value: 'PG' },
  { label: 'UG', value: 'UG' },
  { label: 'OTHER', value: 'OTHER' },


]
/***********************************CompanyUsers**************************************************/
export const customerTypes = [
  //customer
  { label: 'MANUFACTURER', value: 'MANUFACTURER' },
  { label: 'DEALER', value: 'DEALER' },
  { label: 'SERVICE_PROVIDER', value: 'SERVICE_PROVIDER' },
  { label: 'RD_ORG', value: 'RD_ORG' },
  { label: 'MEDICAL_PROF', value: 'MEDICAL_PROF' },
  { label: 'BME_SENIOR', value: 'BME_SENIOR' },
  { label: 'BME_STUDENT', value: 'BME_STUDENT' },
]

//Company BusinessType
export const BusinessType = [
  { key: 'PRODUCT_BASE', value: 'PRODUCT' },
  { key: 'SERVICE_BASE', value: 'SERVICE' },

]

/***********************************CompnayjobPostscreen**************************************************/

//CountryCodes
export const CountryCodes = [

  { "label": "AF", "value": "+93" },
  { "label": "AL", "value": "+355" },
  { "label": "DZ", "value": "+213" },
  { "label": "AD", "value": "+376" },
  { "label": "AO", "value": "+244" },
  { "label": "AG", "value": "+1-268" },
  { "label": "AR", "value": "+54" },
  { "label": "AM", "value": "+374" },
  { "label": "AU", "value": "+61" },
  { "label": "AT", "value": "+43" },
  { "label": "AZ", "value": "+994" },
  { "label": "BS", "value": "+1-242" },
  { "label": "BH", "value": "+973" },
  { "label": "BD", "value": "+880" },
  { "label": "BB", "value": "+1-246" },
  { "label": "BY", "value": "+375" },
  { "label": "BE", "value": "+32" },
  { "label": "BZ", "value": "+501" },
  { "label": "BJ", "value": "+229" },
  { "label": "BT", "value": "+975" },
  { "label": "BO", "value": "+591" },
  { "label": "BA", "value": "+387" },
  { "label": "BW", "value": "+267" },
  { "label": "BR", "value": "+55" },
  { "label": "BN", "value": "+673" },
  { "label": "BG", "value": "+359" },
  { "label": "BF", "value": "+226" },
  { "label": "BI", "value": "+257" },
  { "label": "CV", "value": "+238" },
  { "label": "KH", "value": "+855" },
  { "label": "CM", "value": "+237" },
  { "label": "CA", "value": "+1" },
  { "label": "CF", "value": "+236" },
  { "label": "TD", "value": "+235" },
  { "label": "CL", "value": "+56" },
  { "label": "CN", "value": "+86" },
  { "label": "CO", "value": "+57" },
  { "label": "KM", "value": "+269" },
  { "label": "CD", "value": "+243" },
  { "label": "CG", "value": "+242" },
  { "label": "CR", "value": "+506" },
  { "label": "HR", "value": "+385" },
  { "label": "CU", "value": "+53" },
  { "label": "CY", "value": "+357" },
  { "label": "CZ", "value": "+420" },
  { "label": "DK", "value": "+45" },
  { "label": "DJ", "value": "+253" },
  { "label": "DM", "value": "+1-767" },
  { "label": "DO", "value": "+1-809" },
  { "label": "EC", "value": "+593" },
  { "label": "EG", "value": "+20" },
  { "label": "SV", "value": "+503" },
  { "label": "GQ", "value": "+240" },
  { "label": "ER", "value": "+291" },
  { "label": "EE", "value": "+372" },
  { "label": "SZ", "value": "+268" },
  { "label": "ET", "value": "+251" },
  { "label": "FJ", "value": "+679" },
  { "label": "FI", "value": "+358" },
  { "label": "FR", "value": "+33" },
  { "label": "GA", "value": "+241" },
  { "label": "GM", "value": "+220" },
  { "label": "GE", "value": "+995" },
  { "label": "DE", "value": "+49" },
  { "label": "GH", "value": "+233" },
  { "label": "GR", "value": "+30" },
  { "label": "GD", "value": "+1-473" },
  { "label": "GT", "value": "+502" },
  { "label": "GN", "value": "+224" },
  { "label": "GW", "value": "+245" },
  { "label": "GY", "value": "+592" },
  { "label": "HT", "value": "+509" },
  { "label": "HN", "value": "+504" },
  { "label": "HU", "value": "+36" },
  { "label": "IS", "value": "+354" },
  { "label": "IN", "value": "+91" },
  { "label": "ID", "value": "+62" },
  { "label": "IR", "value": "+98" },
  { "label": "IQ", "value": "+964" },
  { "label": "IE", "value": "+353" },
  { "label": "IL", "value": "+972" },
  { "label": "IT", "value": "+39" },
  { "label": "JM", "value": "+1-876" },
  { "label": "JP", "value": "+81" },
  { "label": "JO", "value": "+962" },
  { "label": "KZ", "value": "+7" },
  { "label": "KE", "value": "+254" },
  { "label": "KI", "value": "+686" },
  { "label": "KP", "value": "+850" },
  { "label": "KR", "value": "+82" },
  { "label": "KW", "value": "+965" },
  { "label": "KG", "value": "+996" },
  { "label": "LA", "value": "+856" },
  { "label": "LV", "value": "+371" },
  { "label": "LB", "value": "+961" },
  { "label": "LS", "value": "+266" },
  { "label": "LR", "value": "+231" },
  { "label": "LY", "value": "+218" },
  { "label": "LI", "value": "+423" },
  { "label": "LT", "value": "+370" },
  { "label": "LU", "value": "+352" },
  { "label": "MG", "value": "+261" },
  { "label": "MW", "value": "+265" },
  { "label": "MY", "value": "+60" },
  { "label": "MV", "value": "+960" },
  { "label": "ML", "value": "+223" },
  { "label": "MT", "value": "+356" },
  { "label": "MH", "value": "+692" },
  { "label": "MR", "value": "+222" },
  { "label": "MU", "value": "+230" },
  { "label": "MX", "value": "+52" },
  { "label": "FM", "value": "+691" },
  { "label": "MD", "value": "+373" },
  { "label": "MC", "value": "+377" },
  { "label": "MN", "value": "+976" },
  { "label": "ME", "value": "+382" },
  { "label": "MA", "value": "+212" },
  { "label": "MZ", "value": "+258" },
  { "label": "MM", "value": "+95" },
  { "label": "NA", "value": "+264" },
  { "label": "NR", "value": "+674" },
  { "label": "NP", "value": "+977" },
  { "label": "NL", "value": "+31" },
  { "label": "NZ", "value": "+64" },
  { "label": "NI", "value": "+505" },
  { "label": "NE", "value": "+227" },
  { "label": "NG", "value": "+234" },
  { "label": "MK", "value": "+389" },
  { "label": "NO", "value": "+47" },
  { "label": "OM", "value": "+968" },
  { "label": "PK", "value": "+92" },
  { "label": "PW", "value": "+680" },
  { "label": "PA", "value": "+507" },
  { "label": "PG", "value": "+675" },
  { "label": "PY", "value": "+595" },
  { "label": "PE", "value": "+51" },
  { "label": "PH", "value": "+63" },
  { "label": "PL", "value": "+48" },
  { "label": "PT", "value": "+351" },
  { "label": "QA", "value": "+974" },
  { "label": "RO", "value": "+40" },
  { "label": "RU", "value": "+7" },
  { "label": "RW", "value": "+250" },
  { "label": "KN", "value": "+1-869" },
  { "label": "LC", "value": "+1-758" },
  { "label": "VC", "value": "+1-784" },
  { "label": "WS", "value": "+685" },
  { "label": "SM", "value": "+378" },
  { "label": "ST", "value": "+239" },
  { "label": "SA", "value": "+966" },
  { "label": "SN", "value": "+221" },
  { "label": "RS", "value": "+381" },
  { "label": "SC", "value": "+248" },
  { "label": "SL", "value": "+232" },
  { "label": "SG", "value": "+65" },
  { "label": "SK", "value": "+421" },
  { "label": "SI", "value": "+386" },
  { "label": "SB", "value": "+677" },
  { "label": "SO", "value": "+252" },
  { "label": "ZA", "value": "+27" },
  { "label": "SS", "value": "+211" },
  { "label": "ES", "value": "+34" },
  { "label": "LK", "value": "+94" },
  { "label": "SD", "value": "+249" },
  { "label": "SR", "value": "+597" },
  { "label": "SE", "value": "+46" },
  { "label": "SG", "value": "+65" },
  { "label": "SK", "value": "+421" },
  { "label": "SI", "value": "+386" },
  { "label": "SB", "value": "+677" },
  { "label": "SO", "value": "+252" },
  { "label": "ZA", "value": "+27" },
  { "label": "SS", "value": "+211" },
  { "label": "ES", "value": "+34" },
  { "label": "LK", "value": "+94" },
  { "label": "SD", "value": "+249" },
  { "label": "SR", "value": "+597" },
  { "label": "SE", "value": "+46" },
  { "label": "SG", "value": "+65" },
  { "label": "SK", "value": "+421" },
  { "label": "SI", "value": "+386" },
  { "label": "SB", "value": "+677" },
  { "label": "SO", "value": "+252" },
  { "label": "ZA", "value": "+27" },
  { "label": "SS", "value": "+211" },
  { "label": "ES", "value": "+34" },
  { "label": "LK", "value": "+94" },
  { "label": "SD", "value": "+249" },
  { "label": "SR", "value": "+597" },
  { "label": "SE", "value": "+46" },
  { "label": "SG", "value": "+65" },
  { "label": "SK", "value": "+421" },
  { "label": "SI", "value": "+386" },
  { "label": "SB", "value": "+677" },
  { "label": "SO", "value": "+252" },
  { "label": "ZA", "value": "+27" },
  { "label": "SS", "value": "+211" }

]
export const stateCityData = {
  "Andaman and Nicobar Islands": [
    "Port Blair",
    "Car Nicobar",
    "Little Andaman",
    "Havelock Island",
    "Neil Island",
    "Diglipur",
    "Rangat"
  ],
  "Andhra Pradesh": [
    "Visakhapatnam",
    "Vijayawada",
    "Guntur",
    "Nellore",
    "Kurnool",
    "Kadapa",
    "Rajahmundry",
    "Tirupati",
    "Anantapur",
    "Eluru",
    "Ongole",
    "Chittoor",
    "Machilipatnam",
    "Srikakulam",
    "Vizianagaram",
    "Tenali",
    "Hindupur",
    "Proddatur",
    "Nandyal",
    "Bhimavaram"
  ],
  "Arunachal Pradesh": [
    "Itanagar",
    "Naharlagun",
    "Tawang",
    "Bomdila",
    "Ziro",
    "Pasighat",
    "Aalo",
    "Tezu",
    "Roing",
    "Daporijo",
    "Seppa",
    "Khonsa",
    "Yingkiong",
    "Changlang",
    "Anini",
    "Namsai"
  ],
  "Assam": [
    "Guwahati",
    "Silchar",
    "Dibrugarh",
    "Jorhat",
    "Nagaon",
    "Tinsukia",
    "Tezpur",
    "Bongaigaon",
    "Dhubri",
    "North Lakhimpur",
    "Sivasagar",
    "Diphu",
    "Karimganj",
    "Goalpara",
    "Barpeta",
    "Golaghat",
    "Haflong",
    "Kokrajhar",
    "Morigaon",
    "Nalbari"
  ],
  "Bihar": [
    "Patna",
    "Gaya",
    "Bhagalpur",
    "Muzaffarpur",
    "Darbhanga",
    "Purnia",
    "Bihar Sharif",
    "Arrah",
    "Begusarai",
    "Katihar",
    "Munger",
    "Chhapra",
    "Bettiah",
    "Saharsa",
    "Sasaram",
    "Hajipur",
    "Dehri",
    "Siwan",
    "Motihari",
    "Nawada",
    "Jamalpur",
    "Buxar",
    "Kishanganj",
    "Bagaha",
    "Sitamarhi",
    "Samastipur",
    "Aurangabad",
    "Lakhisarai",
    "Sheikhpura",
    "Jehanabad",
    "Khagaria",
    "Supaul",
    "Madhubani",
    "Gopalganj",
    "Madhepura"
  ],
  "Chandigarh": [
    "Chandigarh",
    "Panchkula ",
    "Mohali"
  ],
  "Chhattisgarh": [
    "Raipur",
    "Bilaspur",
    "Bhilai",
    "Korba",
    "Durg",
    "Rajnandgaon",
    "Jagdalpur",
    "Raigarh",
    "Ambikapur",
    "Dhamtari",
    "Mahasamund",
    "Kanker",
    "Kabirdham",
    "Dantewada",
    "Janjgir-Champa",
    "Sukma",
    "Bijapur",
    "Kondagaon",
    "Surajpur",
    "Balod",
    "Baloda Bazar",
    "Bemetara",
    "Gariaband",
    "Jashpur",
    "Mungeli",
    "Narayanpur"
  ],
  "Delhi": [
    "New Delhi",
    "Delhi",
    "Old Delhi",
    "Rohini",
    "Dwarka",
    "Vasant Kunj",
    "Pitampura",
    "Karol Bagh",
    "Connaught Place",
    "Janakpuri"
  ],
  "Dadra and Nagar Haveli and Daman and Diu": [
    "Silvassa ",
    "Daman ",
    "Diu",
    "Vapi",
    "Kachigam"
  ],
  "Goa": [
    "Panaji",
    "Margao",
    "Vasco da Gama",
    "Mapusa",
    "Ponda",
    "Bicholim",
    "Curchorem",
    "Sanquelim",
    "Valpoi",
    "Cuncolim",
    "Quepem"
  ],
  "Gujarat": [
    "Ahmedabad",
    "Surat",
    "Vadodara",
    "Rajkot",
    "Bhavnagar",
    "Jamnagar",
    "Junagadh",
    "Gandhinagar",
    "Anand",
    "Vapi",
    "Navsari",
    "Bharuch",
    "Mehsana",
    "Nadiad",
    "Morbi",
    "Palanpur",
    "Porbandar",
    "Surendranagar",
    "Bhuj",
    "Godhra",
    "Patan",
    "Botad",
    "Amreli",
    "Deesa",
    "Dahod",
    "Himmatnagar",
    "Modasa",
    "Veraval",
    "Valsad",
    "Gandhidham"
  ],
  "Haryana": [
    "Gurgaon ",
    "Faridabad",
    "Panipat",
    "Ambala",
    "Karnal",
    "Hisar",
    "Rohtak",
    "Sonipat",
    "Yamunanagar",
    "Panchkula",
    "Bhiwani",
    "Jind",
    "Sirsa",
    "Bahadurgarh",
    "Palwal",
    "Rewari",
    "Kaithal",
    "Kurukshetra",
    "Fatehabad",
    "Jhajjar",
    "Mahendragarh",
    "Charkhi Dadri",
    "Narnaul",
    "Hansi",
    "Gohana"
  ],
  "Himachal Pradesh": [
    "Shimla ",
    "Manali",
    "Dharamshala",
    "Solan",
    "Mandi",
    "Kullu",
    "Chamba",
    "Bilaspur",
    "Hamirpur",
    "Kangra",
    "Kinnaur",
    "Lahaul and Spiti",
    "Una",
    "Nalagarh",
    "Paonta Sahib",
    "Sundernagar",
    "Nahan",
    "Baddi",
    "Palampur",
    "Keylong"
  ],
  "Jharkhand": [
    "Ranchi ",
    "Jamshedpur",
    "Dhanbad",
    "Bokaro Steel City",
    "Hazaribagh",
    "Dumka",
    "Giridih",
    "Deoghar",
    "Ramgarh",
    "Koderma",
    "Chaibasa",
    "Medininagar ",
    "Pakur",
    "Palamu",
    "Khunti",
    "Sahebganj",
    "Lohardaga",
    "Jamtara",
    "Simdega",
    "Ghatshila"
  ],
  "Jammu and Kashmir": [
    "Srinagar",
    "Jammu ",
    "Anantnag",
    "Baramulla",
    "Udhampur",
    "Kathua",
    "Rajouri",
    "Poonch"
  ],
  "Karnataka": [
    "Bengaluru",
    "Mysuru ",
    "Hubballi ",
    "Dharwad",
    "Mangaluru ",
    "Bellary",
    "Tumakuru ",
    "Udupi",
    "Bidar",
    "Vijayapura ",
    "Kalaburagi ",
    "Hampi",
    "Chikkamagaluru ",
    "Hassan",
    "Kolar",
    "Davanagere",
    "Raichur",
    "Bagalkot",
    "Gadag",
    "Yadgir",
    "Karwar",
    "Shimoga ",
    "Chitradurga",
    "Sira"
  ],
  "Kerala": [
    "Thiruvananthapuram ",
    "Kochi ",
    "Kozhikode ",
    "Malappuram",
    "Thrissur ",
    "Kollam ",
    "Alappuzha ",
    "Palakkad",
    "Kannur",
    "Kottayam",
    "Wayanad",
    "Kasaragod",
    "Idukki",
    "Pathanamthitta",
    "Ernakulam",
    "Ponnani",
    "Cherthala",
    "Muvattupuzha",
    "Kalpetta",
    "Guruvayur"
  ],
  "Ladakh": [
    "Leh ",
    "Kargil",
    "Nubra Valley",
    "Zanskar Valley"
  ],
  "Lakshadweep": [
    "Kavaratti",
    "Minicoy",
    "Agatti",
    "Kalapeni",
    "Suheli Atoll",
    "Bangaram",
    "Andrott"
  ],
  "Madhya Pradesh": [
    "Bhopal",
    "Indore",
    "Gwalior",
    "Jabalpur",
    "Ujjain",
    "Sagar",
    "Satna",
    "Rewa",
    "Burhanpur",
    "Ratlam",
    "Khandwa",
    "Morena",
    "Chhindwara",
    "Shajapur",
    "Vidisha",
    "Mandsaur",
    "Sehore",
    "Hoshangabad",
    "Damoh",
    "Tikamgarh",
    "Jhabua",
    "Balaghat",
    "Ashoknagar"
  ],
  "Maharashtra": [
    "Mumbai",
    "Pune",
    "Nagpur",
    "Thane",
    "Nashik",
    "Aurangabad",
    "Solapur",
    "Kolhapur",
    "Satara",
    "Jalgaon",
    "Amravati",
    "Chandrapur",
    "Akola",
    "Latur",
    "Ahmednagar",
    "Kalyan-Dombivli",
    "Vasai-Virar",
    "Nanded",
    "Parbhani",
    "Osmanabad",
    "Sangli",
    "Raigad",
    "Palghar",
    "Washim",
    "Bhandara"
  ],
  "Manipur": [
    "Imphal",
    "Thoubal",
    "Moreh",
    "Churachandpur",
    "Kakching",
    "Bishnupur",
    "Jiribam",
    "Senapati",
    "Tamenglong",
    "Ukhrul",
    "Kangpokpi",
    "Moirang",
    "Khongjom",
    "Yairipok"
  ],
  "Meghalaya": [
    "Shillong",
    "Tura",
    "Jowai",
    "Nongpoh",
    "Williamnagar",
    "Baghmara",
    "Nongstoin",
    "Mawkyrwat",
    "Cherrapunji",
    "Dawki",
    "Mairang"
  ],
  "Mizoram": [
    "Aizawl",
    "Lunglei",
    "Champhai",
    "Kolasib",
    "Mamit",
    "Serchhip",
    "Lawngtlai",
    "Hnahthial",
    "Siaha",
    "Khawzawl",
    "Buangpui",
    "Lungleh",
    "Hualngoh"
  ],
  "Nagaland": [
    "Kohima ",
    "Dimapur",
    "Mokokchung",
    "Tuensang",
    "Wokha",
    "Zunheboto",
    "Phek",
    "Mon",
    "Longleng",
    "Kiphire",
    "Jalukie",
    "Chumukedima"
  ],
  "Odisha": [
    "Bhubaneswar",
    "Cuttack",
    "Rourkela",
    "Berhampur ",
    "Sambalpur",
    "Balasore ",
    "Jeypore",
    "Kendrapara",
    "Baripada",
    "Kalahandi",
    "Dhenkanal",
    "Bargarh",
    "Rairangpur",
    "Jajpur",
    "Angul",
    "Jharsuguda",
    "Nabarangpur",
    "Boudh",
    "Phulbani",
    "Ganjam"
  ],
  "Puducherry": [
    "Puducherry ",
    "Karaikal",
    "Yanam",
    "Mahe"
  ],
  "Punjab": [
    "Chandigarh ",
    "Amritsar",
    "Ludhiana",
    "Jalandhar",
    "Patiala",
    "Bathinda",
    "Mohali ",
    "Hoshiarpur",
    "Moga",
    "Ferozepur",
    "Rupnagar",
    "Faridkot",
    "Kapurthala",
    "Gurdaspur",
    "Sangrur",
    "Mansa",
    "Tarn Taran",
    "Barnala",
    "Malerkotla",
    "Phagwara"
  ],
  "Rajasthan": [
    "Jaipur",
    "Jodhpur",
    "Udaipur",
    "Kota",
    "Ajmer",
    "Bikaner",
    "Bharatpur",
    "Alwar",
    "Pali",
    "Jhunjhunu",
    "Sikar",
    "Churu",
    "Sawai Madhopur",
    "Hanumangarh",
    "Sri Ganganagar",
    "Tonk",
    "Nagaur",
    "Jaisalmer",
    "Barmer",
    "Dungarpur",
    "Bundi",
    "Karauli",
    "Rajsamand"
  ],
  "Sikkim": [
    "Gangtok",
    "Namchi",
    "Mangan",
    "Pelling",
    "Ravangla",
    "Jorethang",
    "Singtam",
    "Rhenock",
    "Dikchu"
  ],
  "Tamil Nadu": [
    "Chennai ",
    "Coimbatore",
    "Madurai",
    "Tiruchirappalli",
    "Salem",
    "Tirunelveli",
    "Erode",
    "Vellore",
    "Thanjavur",
    "Karur",
    "Dindigul",
    "Nagercoil",
    "Cuddalore",
    "Kanchipuram",
    "Kumbakonam",
    "Hosur",
    "Arakkonam",
    "Virudhunagar",
    "Chengalpattu",
    "Pollachi"
  ],
  "Telangana": [
    "Hyderabad ",
    "Warangal",
    "Nizamabad",
    "Karimnagar",
    "Khammam",
    "Mahbubnagar",
    "Adilabad",
    "Ramagundam",
    "Medak",
    "Jagtiyal",
    "Mancherial",
    "Kamareddy",
    "Siddipet",
    "Nalgonda",
    "Bhainsa",
    "Kothagudem",
    "Peddapalli",
    "Wanaparthy",
    "Mahabubabad",
    "Jagtial"
  ],
  "Tripura": [
    "Agartala",
    "Udaipur",
    "Dharmanagar",
    "Kailasahar",
    "Belonia",
    "Ambassa",
    "Khowai",
    "Sabroom",
    "Kumarghat",
    "Manughat",
    "Teliamura",
    "Mohanpur",
    "Jirania",
    "Bishalgarh",
    "Melaghar"
  ],
  "Uttar Pradesh": [
    "Lucknow",
    "Kanpur",
    "Agra",
    "Varanasi",
    "Allahabad",
    "Ghaziabad",
    "Meerut",
    "Noida",
    "Mathura",
    "Aligarh",
    "Jhansi",
    "Bareilly",
    "Moradabad",
    "Saharanpur",
    "Firozabad",
    "Rampur",
    "Gorakhpur",
    "Auraiya",
    "Etawah",
    "Bulandshahr",
    "Sitapur",
    "Muzaffarnagar",
    "Hapur",
    "Amroha",
    "Basti",
    "Shahjahanpur"
  ],
  "Uttarakhand": [
    "Dehradun",
    "Haridwar",
    "Nainital",
    "Rishikesh",
    "Haldwani",
    "Roorkee",
    "Almora",
    "Pithoragarh",
    "Mussoorie",
    "Udham Singh Nagar",
    "Kashipur",
    "Rudrapur",
    "Bageshwar",
    "Champawat",
    "Tehri",
    "New Tehri",
    "Doiwala",
    "Bijnor",
    "Kotdwar",
    "Jaspur"
  ],
  "West Bengal": [
    "Kolkata",
    "Howrah",
    "Siliguri",
    "Darjeeling",
    "Asansol",
    "Durgapur",
    "Kharagpur",
    "Bardhaman",
    "Jalpaiguri",
    "Midnapore",
    "Haldia",
    "Kalyani",
    "Cooch Behar",
    "Raniganj",
    "Bankura",
    "Purulia",
    "Berhampore",
    "Malda",
    "Krishnanagar",
    "Nadia",
    "Alipurduar",
    "Jhargram"
  ]
}


//IndustryType 
export const industryType = [
  { label: 'Hospital', value: '0' },
  { label: 'Service Industry', value: '1' },
  { label: 'Manufacturer', value: '2' },
  { label: 'Research And Development', value: '3' },
  { label: 'Calibration Laboratory', value: '4' },
  { label: 'Training', value: '5' },
  { label: 'Facilities', value: '6' },
  { label: 'MEP Engineering', value: '7' },
  { label: 'Consultancy', value: '8' },
  { label: 'Management', value: '9' },
  { label: 'Standards And Certifications', value: '10' },
];

// assets/industrySkills.js
export const industrySkills = {
  "Hospital": [
    { label: "Clinical Equipment Maintenance", value: "Clinical Equipment Maintenance" },
    { label: "Patient Monitoring Systems", value: "Patient Monitoring Systems" },
    { label: "Medical Device Safety Compliance", value: "Medical Device Safety Compliance" },
    { label: "Biomedical Waste Management", value: "Biomedical Waste Management" },
    { label: "Hospital Workflow Optimization", value: "Hospital Workflow Optimization" },
    { label: "Operation Theater Equipment Handling", value: "Operation Theater Equipment Handling" }
  ],

  "Service Industry": [
    { label: "Multi-brand Equipment Servicing", value: "Multi-brand Equipment Servicing" },
    { label: "Service Report Documentation", value: "Service Report Documentation" },
    { label: "Customer Support & AMC Handling", value: "Customer Support & AMC Handling" },
    { label: "On-site Troubleshooting & Calibration", value: "On-site Troubleshooting & Calibration" }
  ],

  "Manufacturer": [
    { label: "Medical Device Design & Prototyping", value: "Medical Device Design & Prototyping" },
    { label: "Product Validation & Testing", value: "Product Validation & Testing" },
    { label: "Regulatory Compliance", value: "Regulatory Compliance" },
    { label: "Electromechanical Assembly", value: "Electromechanical Assembly" },
    { label: "Component Sourcing & Vendor Management", value: "Component Sourcing & Vendor Management" }
  ],

  "Research And Development": [
    { label: "Biomedical Innovation", value: "Biomedical Innovation" },
    { label: "Clinical Trials & Protocol Design", value: "Clinical Trials & Protocol Design" },
    { label: "Prototype Testing & Feedback Iteration", value: "Prototype Testing & Feedback Iteration" },
    { label: "Grant Proposal Writing", value: "Grant Proposal Writing" }
  ],

  "Calibration Laboratory": [
    { label: "Traceable Calibration Procedures", value: "Traceable Calibration Procedures" },
    { label: "Use of Reference Instruments", value: "Use of Reference Instruments" },
    { label: "NABL/ISO17025 Documentation Practices", value: "NABL/ISO17025 Documentation Practices" }
  ],

  "Training": [
    { label: "Hands-on Equipment Training", value: "Hands-on Equipment Training" },
    { label: "Technical Content Creation", value: "Technical Content Creation" },
    { label: "Virtual and On-site Training Programs", value: "Virtual and On-site Training Programs" }
  ],

  "Facilities": [
    { label: "Healthcare Infrastructure Planning", value: "Healthcare Infrastructure Planning" },
    { label: "Gas Line and Power Supply Coordination", value: "Gas Line and Power Supply Coordination" },
    { label: "Clean Room Maintenance", value: "Clean Room Maintenance" }
  ],

  "MEP Engineering": [
    { label: "Hospital HVAC System Design", value: "Hospital HVAC System Design" },
    { label: "Medical Gas Pipeline Systems", value: "Medical Gas Pipeline Systems" },
    { label: "Electrical Safety Testing in Hospitals", value: "Electrical Safety Testing in Hospitals" }
  ],

  "Consultancy": [
    { label: "Medical Equipment Planning", value: "Medical Equipment Planning" },
    { label: "Hospital Setup Advisory", value: "Hospital Setup Advisory" },
    { label: "Technology Feasibility Assessment", value: "Technology Feasibility Assessment" }
  ],

  "Management": [
    { label: "Biomedical Asset Management", value: "Biomedical Asset Management" },
    { label: "Vendor & Contract Management", value: "Vendor & Contract Management" },
    { label: "Budget Planning for Medical Tech", value: "Budget Planning for Medical Tech" }
  ],

  "Standards And Certifications": [
    { label: "ISO 13485 Compliance", value: "ISO 13485 Compliance" },
    { label: "CE Marking Guidance", value: "CE Marking Guidance" }
  ]
};


export const topTierCities = [
  { label: "Agra", value: "Agra" },
  { label: "Ahmedabad", value: "Ahmedabad" },
  { label: "Ajmer", value: "Ajmer" },
  { label: "Aligarh", value: "Aligarh" },
  { label: "Amritsar", value: "Amritsar" },
  { label: "Anantapur", value: "Anantapur" },
  { label: "Bareilly", value: "Bareilly" },
  { label: "Belgaum", value: "Belgaum" },
  { label: "Bengaluru", value: "Bengaluru" },
  { label: "Bhagalpur", value: "Bhagalpur" },
  { label: "Bhopal", value: "Bhopal" },
  { label: "Bilaspur", value: "Bilaspur" },
  { label: "Chandigarh", value: "Chandigarh" },
  { label: "Chennai", value: "Chennai" },
  { label: "Coimbatore", value: "Coimbatore" },
  { label: "Cuttack", value: "Cuttack" },
  { label: "Dehradun", value: "Dehradun" },
  { label: "Delhi", value: "Delhi" },
  { label: "Dhanbad", value: "Dhanbad" },
  { label: "Erode", value: "Erode" },
  { label: "Ghaziabad", value: "Ghaziabad" },
  { label: "Guntur", value: "Guntur" },
  { label: "Guwahati", value: "Guwahati" },
  { label: "Gwalior", value: "Gwalior" },
  { label: "Hubli-Dharwad", value: "Hubli-Dharwad" },
  { label: "Hyderabad", value: "Hyderabad" },
  { label: "Indore", value: "Indore" },
  { label: "Jaipur", value: "Jaipur" },
  { label: "Jalandhar", value: "Jalandhar" },
  { label: "Jammu", value: "Jammu" },
  { label: "Jamshedpur", value: "Jamshedpur" },
  { label: "Jhansi", value: "Jhansi" },
  { label: "Jodhpur", value: "Jodhpur" },
  { label: "Kanpur", value: "Kanpur" },
  { label: "Kolhapur", value: "Kolhapur" },
  { label: "Kolkata", value: "Kolkata" },
  { label: "Kollam", value: "Kollam" },
  { label: "Kota", value: "Kota" },
  { label: "Lucknow", value: "Lucknow" },
  { label: "Ludhiana", value: "Ludhiana" },
  { label: "Madurai", value: "Madurai" },
  { label: "Mumbai", value: "Mumbai" },
  { label: "Mysuru", value: "Mysuru" },
  { label: "Nagpur", value: "Nagpur" },
  { label: "Nanded", value: "Nanded" },
  { label: "Nashik", value: "Nashik" },
  { label: "Nellore", value: "Nellore" },
  { label: "Noida", value: "Noida" },
  { label: "Patna", value: "Patna" },
  { label: "Pune", value: "Pune" },
  { label: "Raipur", value: "Raipur" },
  { label: "Rajkot", value: "Rajkot" },
  { label: "Ranchi", value: "Ranchi" },
  { label: "Salem", value: "Salem" },
  { label: "Shimla", value: "Shimla" },
  { label: "Siliguri", value: "Siliguri" },
  { label: "Srinagar", value: "Srinagar" },
  { label: "Surat", value: "Surat" },
  { label: "Thiruvananthapuram", value: "Thiruvananthapuram" },
  { label: "Thrissur", value: "Thrissur" },
  { label: "Tiruchirappalli", value: "Tiruchirappalli" },
  { label: "Tirupati", value: "Tirupati" },
  { label: "Udaipur", value: "Udaipur" },
  { label: "Vadodara", value: "Vadodara" },
  { label: "Varanasi", value: "Varanasi" },
  { label: "Vijayawada", value: "Vijayawada" },
  { label: "Visakhapatnam", value: "Visakhapatnam" },
  { label: "Warangal", value: "Warangal" }
];


//JobHireTimeTye
export const HireType = [

  { label: 'Freelancer', value: '0' },
  { label: 'Full Time BME', value: '1' },
  { label: ' Part Time BMe', value: '2' },
];
//JobExperience required
export const ExperienceType = [
  { label: 'Fresher', value: '0' },
  { label: '1⁺ years', value: '1' },
  { label: '2⁺ years', value: '3' },
  { label: '3⁺ years', value: '4' },
  { label: '4⁺ years', value: '5' },
  { label: 'More than 5 years', value: '6' },
  { label: 'More than 10 years', value: '7' },
];


//JobSpeiciaalizations required
export const Speiciaalization = [
  { label: 'Fresher', value: '0' },
  { label: '1year - 2Year', value: '1' },
  { label: '2year - 3Year', value: '2' },
  { label: '3year - 4Year', value: '3' },
  { label: '4year - 5Year', value: '4' },
  { label: '5year - 10Year', value: '5' },
];

//Job salary/Package
export const SalaryType = [
  { label: '0 - 3 LPA', value: '0' },
  { label: '3 - 6 LPA', value: '1' },
  { label: '6 - 9 LPA', value: '2' },
  { label: '9 - 12 LPA', value: '3' },
  { label: 'More than 12 LPA', value: '4' },
  { label: 'As per company standards', value: '5' },
];

/***********************************UserjobProfilescreen**************************************************/

export const GenderType = [
  { label: 'Male', value: '0' },
  { label: 'Female', value: '1' },
  { label: 'Other', value: '2' },
]
export const DomainStrengthType = [
  { label: 'Low', value: '0' },
  { label: 'Medium', value: '1' },
  { label: 'High', value: '2' },
]

export const ShiftType = [
  { label: 'GeneralShift', value: '0' },
  { label: 'MorningShift', value: '1' },
  { label: 'NightShift', value: '2' },
]
export const NoticePeriodType = [

  { label: 'Immediate join', value: '0' },
  { label: '15Day', value: '1' },
  { label: '1Month', value: '2' },
  { label: '2Month', value: '3' },
]
export const EducationType = [

  { label: 'Gradute', value: '0' },
  { label: 'Post Gradute', value: '1' },
  { label: ' Doctorate', value: '2' },
]
export const LanguagesType = [

  { label: 'Kanada', value: '0' },
  { label: 'English', value: '1' },
  { label: 'Hindi', value: '2' },

]


/***********************************phoneRegex**************************************************/
export const phoneRegex = /^\+?[0-9]{1,3}-?[0-9]{3}-?[0-9]{3}-?[0-9]{4}$/;  //phone valitation
//export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;



export const products = {
  "Medical Devices": [
    "Diagnostic Equipment",
    "Therapeutic Equipment",
    "Monitoring Devices",
    "Imaging Systems",
    "Wearable Medical Devices",
    "Laboratory Equipment",
    "Home Healthcare Devices"
  ],
  "Hospital & Clinical Equipment": [
    "Surgical Instruments",
    "Operation Theater Equipment",
    "ICU & Critical Care Equipment",
    "Patient Monitoring Systems",
    "Hospital Beds & Furniture",
    "Sterilization & Disinfection Equipment"
  ],
  "Medical Implants & Prosthetics": [
    "Orthopedic Implants",
    "Cardiovascular Implants (Pacemakers, Stents)",
    "Neurological Implants",
    "Dental Implants",
    "Prosthetic Limbs & Artificial Organs"
  ],
  "Biomedical Sensors & Components": [
    "Biosensors",
    "MEMS & Nano Sensors",
    "Biocompatible Materials",
    "Medical Transducers"
  ],
  "Biotechnology & Life Sciences": [
    "Biopharmaceuticals",
    "Cell & Gene Therapy Products",
    "Tissue Engineering & Regenerative Medicine",
    "Microfluidics & Lab-on-a-Chip"
  ],
  "Healthcare IT & AI Solutions": [
    "Medical Software & Apps",
    "AI-Based Diagnosis Tools",
    "Electronic Health Records (EHR)",
    "Telemedicine Solutions"
  ],
  "Rehabilitation & Assistive Devices": [
    "Wheelchairs & Mobility Aids",
    "Exoskeletons & Robotic Rehabilitation",
    "Hearing Aids",
    "Vision Aids"
  ],
  "Medical Consumables & Disposables": [
    "Syringes & Needles",
    "Catheters & Tubes",
    "Surgical Sutures & Dressings",
    "Medical Gloves & PPE Kits"
  ],
  "Biomedical Research Equipment": [
    "Microscopes & Spectrophotometers",
    "PCR & DNA Sequencing Equipment",
    "Cell Culture & Bioreactors"
  ],
  "Biomedical Testing Equipment": [
    "Electrophysiology Testing Systems",
    "Biomedical Signal Analysis Tools",
    "Calibration Equipment",
    "Medical Device Testing Kits",
    "Biochemical Analyzers"
  ],
  "Healthcare & Hospital Services": [
    "Medical Equipment Maintenance & Repair",
    "Hospital Management Solutions",
    "Medical Waste Disposal Services"
  ],
  "Laboratory & Testing Equipment": [
    "Blood Analyzers",
    "Urine Analyzers",
    "Pathology & Microbiology Testing Equipment"
  ],
  "Oxygen & Respiratory Care": [
    "Oxygen Concentrators",
    "Ventilators & CPAP/BiPAP Machines",
    "Nebulizers & Respiratory Aids"
  ],
  "3D Printing in Healthcare": [
    "3D Printed Prosthetics",
    "Bioprinting Solutions",
    "Custom Medical Implants"
  ]
}
export const product_category = [
  { label: 'Dialysis Machine', value: '0' },
  { label: 'Ventilator', value: '1' },
  { label: 'Patient Monitor', value: '2' },
]

export const applications = [
  { label: 'Haemodialysis', value: '0' },
  { label: 'ICU', value: '1' },
  { label: 'Operating Room', value: '2' },
  { label: 'others', value: '3' },

]

export const operation_mode = [
  { label: 'Manual', value: '0' },
  { label: 'Semi Automatic', value: '1' },
  { label: 'Automatic', value: '2' },
  { label: 'others', value: '3' },

]

export const types = [
  { label: 'Clincal Use', value: '0' },
  { label: 'Home Use', value: '1' },
  { label: 'Portable', value: '2' },
  { label: 'Fixed', value: '3' },
  { label: 'others', value: '4' },

]

export const power_supply = [
  { label: 'AC/DC', value: '0' },
  { label: 'Voltage', value: '1' },
  { label: 'Frequency', value: '2' },
  { label: 'others', value: '3' },
]

export const certifications = [
  { label: 'CE', value: '0' },
  { label: 'FDA', value: '1' },
  { label: 'ISO 13485', value: '2' },
  { label: 'BIS', value: '3' },
  { label: 'others', value: '4' },

]

export const availability = [
  { label: 'In Stocks', value: '0' },
  { label: 'Pre-Order', value: '1' },
  { label: 'others', value: '2' },

]

export const installation_support = [
  { label: 'Yes', value: '0' },
  { label: 'No', value: '1' },
  { label: 'On-Site', value: '2' },
  { label: 'Remote', value: '3' },
  { label: 'others', value: '4' },
]

export const after_sales_service = [
  { label: 'Yes', value: '0' },
  { label: 'No', value: '1' },
  { label: 'On-Site', value: '2' },
  { label: 'Remote', value: '3' },
  { label: 'AMC Available', value: '4' },
  { label: 'others', value: '5' },
]



