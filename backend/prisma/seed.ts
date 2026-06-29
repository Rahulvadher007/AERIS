import { prisma } from '../src/lib/prisma';
import { randomUUID } from 'crypto';

// 141 Cities across India with their base parameters
const CITIES_DATA: [string, string, string, number, number, string, number, number, number, number, number][] = [
  // City, State, Region, Lat, Lon, Size, AqiBase, TempBase, HumBase, WindBase, RainBase
  // North
  ['Delhi', 'Delhi', 'North', 28.61, 77.23, 'METRO', 240, 22, 45, 8, 2],
  ['Noida', 'Uttar Pradesh', 'North', 28.57, 77.32, 'TIER2', 220, 22, 42, 9, 2],
  ['Ghaziabad', 'Uttar Pradesh', 'North', 28.67, 77.42, 'TIER2', 230, 22, 42, 8, 2],
  ['Gurugram', 'Haryana', 'North', 28.46, 77.03, 'TIER2', 210, 22, 40, 9, 2],
  ['Faridabad', 'Haryana', 'North', 28.41, 77.32, 'TIER2', 215, 22, 41, 9, 2],
  ['Lucknow', 'Uttar Pradesh', 'North', 26.85, 80.95, 'TIER2', 170, 25, 52, 7, 3],
  ['Kanpur', 'Uttar Pradesh', 'North', 26.45, 80.33, 'TIER2', 195, 25, 50, 7, 3],
  ['Agra', 'Uttar Pradesh', 'North', 27.18, 78.01, 'TIER2', 180, 26, 48, 8, 2],
  ['Varanasi', 'Uttar Pradesh', 'North', 25.32, 82.99, 'TIER2', 155, 26, 58, 6, 4],
  ['Allahabad', 'Uttar Pradesh', 'North', 25.43, 81.85, 'TIER2', 145, 26, 55, 6, 4],
  ['Amritsar', 'Punjab', 'North', 31.63, 74.87, 'TIER2', 135, 19, 50, 8, 2],
  ['Ludhiana', 'Punjab', 'North', 30.90, 75.85, 'TIER2', 160, 20, 48, 9, 2],
  ['Jalandhar', 'Punjab', 'North', 31.32, 75.58, 'TIER2', 125, 20, 48, 8, 2],
  ['Chandigarh', 'Chandigarh', 'North', 30.73, 76.78, 'TIER2', 105, 20, 46, 10, 3],
  ['Srinagar', 'Jammu and Kashmir', 'North', 34.08, 74.80, 'TIER2', 75, 11, 68, 5, 5],
  ['Jammu', 'Jammu and Kashmir', 'North', 32.73, 74.86, 'TIER2', 110, 22, 54, 7, 4],
  ['Greater Noida', 'Uttar Pradesh', 'North', 28.47, 77.50, 'TIER3', 200, 22, 42, 9, 2],
  ['Sonipat', 'Haryana', 'North', 28.99, 77.01, 'TIER3', 185, 22, 40, 9, 2],
  ['Panipat', 'Haryana', 'North', 29.39, 76.96, 'TIER3', 195, 22, 40, 8, 2],
  ['Rohtak', 'Haryana', 'North', 28.89, 76.60, 'TIER3', 170, 22, 42, 8, 2],
  ['Karnal', 'Haryana', 'North', 29.68, 76.99, 'TIER3', 150, 22, 43, 8, 2],
  ['Ambala', 'Haryana', 'North', 30.37, 76.77, 'TIER3', 130, 21, 45, 9, 3],
  ['Patiala', 'Punjab', 'North', 30.33, 76.38, 'TIER3', 125, 20, 48, 9, 2],
  ['Bathinda', 'Punjab', 'North', 30.21, 74.94, 'TIER3', 145, 20, 45, 9, 2],
  ['Pathankot', 'Punjab', 'North', 32.26, 75.64, 'TIER3', 95, 19, 52, 8, 4],
  ['Aligarh', 'Uttar Pradesh', 'North', 27.89, 78.08, 'TIER3', 165, 25, 48, 8, 2],
  ['Gorakhpur', 'Uttar Pradesh', 'North', 26.76, 83.37, 'TIER3', 150, 25, 55, 6, 4],
  ['Bareilly', 'Uttar Pradesh', 'North', 28.36, 79.41, 'TIER3', 155, 24, 52, 7, 3],
  ['Moradabad', 'Uttar Pradesh', 'North', 28.83, 78.77, 'TIER3', 160, 24, 50, 7, 3],
  ['Saharanpur', 'Uttar Pradesh', 'North', 29.96, 77.55, 'TIER3', 140, 23, 48, 8, 3],
  ['Firozabad', 'Uttar Pradesh', 'North', 27.15, 78.39, 'TIER3', 175, 25, 46, 8, 2],
  ['Jhansi', 'Uttar Pradesh', 'North', 25.44, 78.56, 'TIER3', 135, 26, 44, 8, 3],
  ['Muzaffarnagar', 'Uttar Pradesh', 'North', 29.47, 77.70, 'TIER3', 155, 23, 48, 8, 2],
  ['Mathura', 'Uttar Pradesh', 'North', 27.49, 77.67, 'TIER3', 165, 25, 46, 8, 2],
  ['Dharamshala', 'Himachal Pradesh', 'North', 32.21, 76.32, 'TIER3', 50, 15, 62, 8, 7],
  ['Shimla', 'Himachal Pradesh', 'North', 31.10, 77.17, 'TIER3', 45, 13, 64, 9, 8],
  ['Dehradun', 'Uttarakhand', 'North', 30.32, 78.03, 'TIER3', 85, 19, 58, 8, 7],
  ['Haridwar', 'Uttarakhand', 'North', 29.95, 78.16, 'TIER3', 95, 20, 56, 8, 6],
  ['Haldwani', 'Uttarakhand', 'North', 29.21, 79.51, 'TIER3', 90, 21, 58, 7, 6],

  // West
  ['Mumbai', 'Maharashtra', 'West', 19.07, 72.87, 'METRO', 95, 28, 78, 14, 10],
  ['Pune', 'Maharashtra', 'West', 18.52, 73.85, 'METRO', 85, 24, 58, 10, 5],
  ['Ahmedabad', 'Gujarat', 'West', 23.02, 72.57, 'METRO', 145, 30, 48, 11, 3],
  ['Nagpur', 'Maharashtra', 'West', 21.15, 79.08, 'TIER2', 105, 29, 42, 8, 4],
  ['Thane', 'Maharashtra', 'West', 19.21, 72.97, 'TIER2', 110, 28, 80, 13, 9],
  ['Nashik', 'Maharashtra', 'West', 19.99, 73.78, 'TIER2', 80, 24, 55, 11, 4],
  ['Aurangabad', 'Maharashtra', 'West', 19.87, 75.34, 'TIER2', 95, 26, 50, 9, 3],
  ['Solapur', 'Maharashtra', 'West', 17.65, 75.90, 'TIER2', 100, 28, 48, 10, 3],
  ['Surat', 'Gujarat', 'West', 21.17, 72.83, 'TIER2', 125, 29, 68, 12, 5],
  ['Vadodara', 'Gujarat', 'West', 22.30, 73.18, 'TIER2', 115, 28, 60, 10, 4],
  ['Rajkot', 'Gujarat', 'West', 22.30, 70.80, 'TIER2', 110, 29, 56, 12, 3],
  ['Jaipur', 'Rajasthan', 'West', 26.91, 75.78, 'TIER2', 135, 28, 32, 12, 2],
  ['Jodhpur', 'Rajasthan', 'West', 26.23, 73.01, 'TIER2', 125, 30, 28, 13, 1],
  ['Udaipur', 'Rajasthan', 'West', 24.58, 73.71, 'TIER2', 105, 26, 35, 10, 2],
  ['Kota', 'Rajasthan', 'West', 25.18, 75.86, 'TIER2', 120, 29, 38, 9, 3],
  ['Kalyan-Dombivli', 'Maharashtra', 'West', 19.23, 73.13, 'TIER2', 115, 28, 78, 12, 9],
  ['Navi Mumbai', 'Maharashtra', 'West', 19.03, 73.01, 'TIER2', 100, 28, 76, 13, 9],
  ['Kolhapur', 'Maharashtra', 'West', 16.70, 74.24, 'TIER3', 75, 24, 62, 10, 5],
  ['Sangli', 'Maharashtra', 'West', 16.85, 74.58, 'TIER3', 80, 25, 58, 9, 4],
  ['Satara', 'Maharashtra', 'West', 17.68, 73.98, 'TIER3', 70, 24, 60, 10, 5],
  ['Jalgaon', 'Maharashtra', 'West', 21.00, 75.56, 'TIER3', 105, 28, 48, 9, 3],
  ['Dhule', 'Maharashtra', 'West', 20.90, 74.77, 'TIER3', 100, 27, 46, 9, 3],
  ['Chandrapur', 'Maharashtra', 'West', 19.95, 79.29, 'TIER3', 140, 29, 45, 8, 4],
  ['Latur', 'Maharashtra', 'West', 18.40, 76.56, 'TIER3', 90, 27, 50, 9, 3],
  ['Nanded', 'Maharashtra', 'West', 19.16, 77.31, 'TIER3', 95, 28, 48, 9, 3],
  ['Ahmednagar', 'Maharashtra', 'West', 19.09, 74.74, 'TIER3', 85, 26, 52, 10, 3],
  ['Gandhinagar', 'Gujarat', 'West', 23.21, 72.63, 'TIER3', 120, 30, 48, 10, 3],
  ['Bhavnagar', 'Gujarat', 'West', 21.76, 72.15, 'TIER3', 100, 28, 64, 13, 3],
  ['Jamnagar', 'Gujarat', 'West', 22.47, 70.06, 'TIER3', 105, 28, 65, 12, 2],
  ['Anand', 'Gujarat', 'West', 22.56, 72.92, 'TIER3', 110, 29, 58, 10, 3],
  ['Nadiad', 'Gujarat', 'West', 22.69, 72.86, 'TIER3', 105, 29, 58, 10, 3],
  ['Mehsana', 'Gujarat', 'West', 23.58, 72.38, 'TIER3', 120, 30, 45, 9, 3],
  ['Morbi', 'Gujarat', 'West', 22.81, 70.82, 'TIER3', 130, 29, 50, 11, 2],
  ['Vapi', 'Gujarat', 'West', 20.37, 72.90, 'TIER3', 145, 28, 72, 10, 5],
  ['Valsad', 'Gujarat', 'West', 20.59, 72.93, 'TIER3', 115, 28, 72, 11, 5],
  ['Bharuch', 'Gujarat', 'West', 21.70, 72.99, 'TIER3', 135, 29, 65, 10, 4],
  ['Gandhidham', 'Gujarat', 'West', 23.08, 70.13, 'TIER3', 125, 29, 52, 12, 2],
  ['Bhuj', 'Gujarat', 'West', 23.24, 69.66, 'TIER3', 105, 30, 45, 13, 2],
  ['Ajmer', 'Rajasthan', 'West', 26.44, 74.63, 'TIER3', 115, 27, 34, 11, 2],
  ['Bikaner', 'Rajasthan', 'West', 28.02, 73.31, 'TIER3', 130, 29, 30, 13, 1],
  ['Alwar', 'Rajasthan', 'West', 27.55, 76.60, 'TIER3', 125, 27, 35, 11, 2],
  ['Bharatpur', 'Rajasthan', 'West', 27.21, 77.48, 'TIER3', 130, 27, 36, 11, 2],
  ['Bhilwara', 'Rajasthan', 'West', 25.34, 74.63, 'TIER3', 115, 28, 35, 10, 2],
  ['Sikar', 'Rajasthan', 'West', 27.61, 75.13, 'TIER3', 120, 28, 32, 11, 2],
  ['Panaji', 'Goa', 'West', 15.49, 73.82, 'TIER3', 50, 27, 82, 14, 14],

  // South
  ['Bengaluru', 'Karnataka', 'South', 12.97, 77.59, 'METRO', 60, 23, 62, 11, 4],
  ['Chennai', 'Tamil Nadu', 'South', 13.08, 80.27, 'METRO', 75, 30, 75, 14, 5],
  ['Hyderabad', 'Telangana', 'South', 17.38, 78.48, 'METRO', 95, 28, 55, 10, 4],
  ['Coimbatore', 'Tamil Nadu', 'South', 11.01, 76.95, 'TIER2', 55, 26, 62, 12, 3],
  ['Madurai', 'Tamil Nadu', 'South', 9.92, 78.11, 'TIER2', 70, 29, 64, 10, 3],
  ['Visakhapatnam', 'Andhra Pradesh', 'South', 17.68, 83.21, 'TIER2', 90, 28, 74, 13, 5],
  ['Vijayawada', 'Andhra Pradesh', 'South', 16.50, 80.64, 'TIER2', 100, 29, 68, 10, 4],
  ['Kochi', 'Kerala', 'South', 9.93, 76.26, 'TIER2', 50, 27, 82, 12, 15],
  ['Thiruvananthapuram', 'Kerala', 'South', 8.52, 76.93, 'TIER2', 45, 27, 80, 11, 13],
  ['Salem', 'Tamil Nadu', 'South', 11.66, 78.14, 'TIER3', 80, 28, 58, 9, 3],
  ['Tiruchirappalli', 'Tamil Nadu', 'South', 10.79, 78.70, 'TIER3', 75, 29, 62, 11, 3],
  ['Tirunelveli', 'Tamil Nadu', 'South', 8.71, 77.75, 'TIER3', 65, 29, 65, 11, 3],
  ['Vellore', 'Tamil Nadu', 'South', 12.91, 79.13, 'TIER3', 90, 29, 58, 9, 3],
  ['Erode', 'Tamil Nadu', 'South', 11.34, 77.71, 'TIER3', 80, 29, 58, 10, 3],
  ['Thoothukudi', 'Tamil Nadu', 'South', 8.76, 78.13, 'TIER3', 85, 30, 72, 13, 3],
  ['Thanjavur', 'Tamil Nadu', 'South', 10.78, 79.13, 'TIER3', 70, 29, 64, 10, 3],
  ['Warangal', 'Telangana', 'South', 18.00, 79.58, 'TIER3', 85, 28, 52, 9, 4],
  ['Nizamabad', 'Telangana', 'South', 18.67, 78.09, 'TIER3', 80, 28, 50, 9, 3],
  ['Karimnagar', 'Telangana', 'South', 18.43, 79.12, 'TIER3', 85, 28, 50, 9, 3],
  ['Guntur', 'Andhra Pradesh', 'South', 16.30, 80.43, 'TIER3', 105, 29, 64, 10, 4],
  ['Nellore', 'Andhra Pradesh', 'South', 14.44, 79.98, 'TIER3', 80, 30, 70, 12, 4],
  ['Tirupati', 'Andhra Pradesh', 'South', 13.62, 79.41, 'TIER3', 65, 28, 62, 9, 4],
  ['Kurnool', 'Andhra Pradesh', 'South', 15.82, 78.03, 'TIER3', 90, 29, 55, 9, 3],
  ['Kakinada', 'Andhra Pradesh', 'South', 16.98, 82.24, 'TIER3', 85, 29, 72, 12, 4],
  ['Kozhikode', 'Kerala', 'South', 11.25, 75.78, 'TIER3', 55, 27, 80, 11, 14],
  ['Kollam', 'Kerala', 'South', 8.89, 76.61, 'TIER3', 50, 27, 78, 11, 13],
  ['Thrissur', 'Kerala', 'South', 10.52, 76.21, 'TIER3', 55, 27, 80, 10, 12],
  ['Palakkad', 'Kerala', 'South', 10.78, 76.65, 'TIER3', 60, 27, 76, 11, 11],
  ['Kannur', 'Kerala', 'South', 11.87, 75.37, 'TIER3', 55, 27, 80, 11, 13],
  ['Mysuru', 'Karnataka', 'South', 12.29, 76.63, 'TIER3', 50, 24, 60, 9, 3],
  ['Mangaluru', 'Karnataka', 'South', 12.91, 74.85, 'TIER3', 60, 27, 80, 13, 12],
  ['Hubli-Dharwad', 'Karnataka', 'South', 15.36, 75.12, 'TIER3', 80, 26, 52, 10, 3],
  ['Belagavi', 'Karnataka', 'South', 15.84, 74.49, 'TIER3', 70, 24, 60, 9, 4],
  ['Davanagere', 'Karnataka', 'South', 14.46, 75.92, 'TIER3', 80, 26, 54, 9, 3],
  ['Ballari', 'Karnataka', 'South', 15.13, 76.92, 'TIER3', 95, 28, 45, 10, 3],
  ['Shimoga', 'Karnataka', 'South', 13.92, 75.56, 'TIER3', 55, 25, 62, 9, 4],
  ['Tumakuru', 'Karnataka', 'South', 13.33, 77.10, 'TIER3', 65, 25, 60, 9, 3],

  // East
  ['Kolkata', 'West Bengal', 'East', 22.57, 88.36, 'METRO', 145, 27, 76, 10, 7],
  ['Howrah', 'West Bengal', 'East', 22.59, 88.26, 'TIER2', 155, 27, 76, 9, 7],
  ['Patna', 'Bihar', 'East', 25.59, 85.13, 'TIER2', 205, 26, 60, 8, 5],
  ['Ranchi', 'Jharkhand', 'East', 23.34, 85.30, 'TIER2', 115, 23, 52, 10, 4],
  ['Jamshedpur', 'Jharkhand', 'East', 22.80, 86.20, 'TIER2', 135, 26, 56, 9, 4],
  ['Bhubaneswar', 'Odisha', 'East', 20.29, 85.82, 'TIER2', 100, 27, 72, 11, 6],
  ['Durgapur', 'West Bengal', 'East', 23.52, 87.31, 'TIER3', 160, 28, 65, 8, 5],
  ['Siliguri', 'West Bengal', 'East', 26.72, 88.39, 'TIER3', 90, 22, 72, 7, 10],
  ['Asansol', 'West Bengal', 'East', 23.68, 86.98, 'TIER3', 150, 28, 62, 8, 5],
  ['Gaya', 'Bihar', 'East', 24.79, 84.99, 'TIER3', 170, 27, 55, 9, 4],
  ['Bhagalpur', 'Bihar', 'East', 25.24, 86.97, 'TIER3', 185, 26, 62, 8, 5],
  ['Muzaffarpur', 'Bihar', 'East', 26.12, 85.39, 'TIER3', 190, 26, 62, 8, 5],
  ['Dhanbad', 'Jharkhand', 'East', 23.79, 86.43, 'TIER3', 165, 25, 54, 8, 3],
  ['Bokaro', 'Jharkhand', 'East', 23.66, 86.15, 'TIER3', 130, 25, 55, 9, 4],
  ['Cuttack', 'Odisha', 'East', 20.46, 85.87, 'TIER3', 105, 27, 72, 10, 6],
  ['Rourkela', 'Odisha', 'East', 22.26, 84.85, 'TIER3', 130, 26, 60, 8, 4],

  // Central
  ['Bhopal', 'Madhya Pradesh', 'Central', 23.25, 77.41, 'TIER2', 125, 26, 46, 9, 3],
  ['Indore', 'Madhya Pradesh', 'Central', 22.71, 75.85, 'TIER2', 120, 26, 48, 10, 3],
  ['Raipur', 'Chhattisgarh', 'Central', 21.25, 81.62, 'TIER2', 130, 28, 52, 9, 4],
  ['Jabalpur', 'Madhya Pradesh', 'Central', 23.16, 79.93, 'TIER3', 110, 25, 50, 8, 4],
  ['Gwalior', 'Madhya Pradesh', 'Central', 26.21, 78.17, 'TIER3', 175, 27, 40, 10, 2],
  ['Ujjain', 'Madhya Pradesh', 'Central', 23.17, 75.78, 'TIER3', 115, 26, 48, 9, 3],
  ['Bilaspur', 'Chhattisgarh', 'Central', 22.07, 82.13, 'TIER3', 120, 27, 50, 8, 4],
  ['Durg-Bhilai', 'Chhattisgarh', 'Central', 21.19, 81.28, 'TIER3', 125, 28, 50, 8, 3],

  // North-East
  ['Guwahati', 'Assam', 'North-East', 26.14, 91.73, 'TIER2', 110, 24, 76, 7, 9],
  ['Shillong', 'Meghalaya', 'North-East', 25.57, 91.88, 'TIER3', 50, 16, 72, 9, 14],
  ['Agartala', 'Tripura', 'North-East', 23.83, 91.28, 'TIER3', 80, 25, 75, 7, 10],
  ['Imphal', 'Manipur', 'North-East', 24.81, 93.93, 'TIER3', 65, 20, 70, 6, 8],
  ['Aizawl', 'Mizoram', 'North-East', 23.72, 92.71, 'TIER3', 45, 19, 72, 7, 11],
  ['Kohima', 'Nagaland', 'North-East', 25.67, 94.11, 'TIER3', 55, 18, 74, 8, 10],
  ['Gangtok', 'Sikkim', 'North-East', 27.33, 88.61, 'TIER3', 40, 14, 75, 8, 13],
  ['Itanagar', 'Arunachal Pradesh', 'North-East', 27.08, 93.60, 'TIER3', 45, 20, 72, 7, 12],
  ['Dibrugarh', 'Assam', 'North-East', 27.47, 94.91, 'TIER3', 75, 22, 80, 7, 11],
  ['Silchar', 'Assam', 'North-East', 24.83, 92.77, 'TIER3', 80, 24, 78, 6, 11]
];

const NEIGHBORHOODS = [
  'Connaught Place', 'RK Puram', 'Punjabi Bagh', 'ITO', 'Anand Vihar', 'Dwarka',
  'Bandra', 'Colaba', 'Andheri', 'Navi Mumbai', 'Worli', 'Juhu',
  'Whitefield', 'Indiranagar', 'Electronic City', 'Jayanagar', 'Koramangala', 'HSR Layout',
  'Anna Nagar', 'T Nagar', 'Adyar', 'Velachery', 'Ambattur', 'Mylapore',
  'Gachibowli', 'Hitech City', 'Jubilee Hills', 'Banjara Hills', 'Begumpet', 'Secunderabad',
  'Navrangpura', 'Maninagar', 'Bopal', 'Satellite', 'Vastrapur', 'Naranpura',
  'Alkapuri', 'Sayajigunj', 'Fatehgunj', 'Gotri', 'Subhanpura', 'Akota',
  'Adajan', 'Varachha', 'Vesu', 'Katargam', 'Dindoli', 'Athwa',
  'Shivajinagar', 'Kothrud', 'Aundh', 'Hadapsar', 'Baner', 'Viman Nagar',
  'Salt Lake', 'New Town', 'Ballygunge', 'Alipore', 'Park Street', 'Howrah Bridge',
  'Civil Lines', 'Model Town', 'Shastri Nagar', 'Ashok Nagar', 'Nehru Nagar', 'Patel Nagar',
  'Sadar Bazar', 'Malviya Nagar', 'Vaishali Nagar', 'Raja Park', 'Vidhyadhar Nagar', 'Mansarovar',
  'Indrapuri', 'Arera Colony', 'Kolar Road', 'Saket Nagar', 'Maharana Pratap Nagar', 'Govindpura',
  'Vijay Nagar', 'Palasia', 'Rajendra Nagar', 'Bengali Square', 'Khajrana', 'Sudama Nagar',
  'Ramdaspeth', 'Dharampeth', 'Sadashiv Nagar', 'Pratap Nagar', 'Gautam Nagar', 'Vasant Kunj'
];

const INTERVENTION_TEMPLATES = [
  {
    title: 'Arterial Road Traffic Restriction',
    description: 'Enforcement of alternate-day vehicle rotation and diversion of diesel cargo trucks to reduce traffic emissions during peak stagnation.',
    recommendedActions: ['Reroute heavy trucks to outer ring road', 'Increase frequency of electric bus shuttles', 'Implement congestion pricing zone'],
    reduction: '18%',
    reductionPct: 0.18,
    priority: 'HIGH',
    riskLevel: 'HIGH'
  },
  {
    title: 'Construction Site Dust Control Sweep',
    description: 'Mandatory mist cannon deployment, wind fencing inspections, and suspension of excavation activities at high-emission construction corridors.',
    recommendedActions: ['Deploy high-pressure mist cannons', 'Inspect site boundary wind fences', 'Fine non-compliant construction projects'],
    reduction: '25%',
    reductionPct: 0.25,
    priority: 'CRITICAL',
    riskLevel: 'SEVERE'
  },
  {
    title: 'Industrial Sector Furnace Emission Cap',
    description: 'Mandatory command reduction of furnace loads and fuel-switching at brick kilns and manufacturing sites in industrial clusters.',
    recommendedActions: ['Restrict coal consumption in boilers', 'Audit stack scrubber efficiency', 'Mandate low-sulfur fuel transition'],
    reduction: '15%',
    reductionPct: 0.15,
    priority: 'HIGH',
    riskLevel: 'MODERATE'
  },
  {
    title: 'Waste Burning & Open Fire Suppression',
    description: 'Increased municipal patrol frequency and drone surveillance in landfill margins and peri-urban agricultural zones.',
    recommendedActions: ['Deploy landfill patrol squads', 'Establish burning report hotline', 'Drone mapping of thermal signatures'],
    reduction: '10%',
    reductionPct: 0.10,
    priority: 'MEDIUM',
    riskLevel: 'LOW'
  }
];

function randomFloat(min: number, max: number): number {
  return Number((Math.random() * (max - min) + min).toFixed(2));
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const generatedCodes = new Set<string>();
function generateUniqueCode(city: string): string {
  const prefix = city.slice(0, 3).replace(/\s/g, '').toUpperCase();
  let counter = 1;
  while (true) {
    const code = `${prefix}${counter.toString().padStart(3, '0')}`;
    if (!generatedCodes.has(code)) {
      generatedCodes.add(code);
      return code;
    }
    counter++;
  }
}

function generateZonePolygon(lat: number, lon: number, quadrant: number) {
  const dLat = 0.04;
  const dLon = 0.04;
  
  let minLat = lat, maxLat = lat + dLat;
  let minLon = lon, maxLon = lon + dLon;
  
  if (quadrant === 1) { // Northwest
    minLon = lon - dLon; maxLon = lon;
  } else if (quadrant === 2) { // Southeast
    minLat = lat - dLat; maxLat = lat;
  } else if (quadrant === 3) { // Southwest
    minLat = lat - dLat; maxLat = lat;
    minLon = lon - dLon; maxLon = lon;
  }
  
  return {
    type: "Polygon",
    coordinates: [[
      [minLon, minLat],
      [maxLon, minLat],
      [maxLon, maxLat],
      [minLon, maxLat],
      [minLon, minLat]
    ]]
  };
}

function generateRoadLineString(lat: number, lon: number, quadrant: number) {
  const dLat = 0.04;
  const dLon = 0.04;
  
  let minLat = lat, maxLat = lat + dLat;
  let minLon = lon, maxLon = lon + dLon;
  
  if (quadrant === 1) {
    minLon = lon - dLon; maxLon = lon;
  } else if (quadrant === 2) {
    minLat = lat - dLat; maxLat = lat;
  } else if (quadrant === 3) {
    minLat = lat - dLat; maxLat = lat;
    minLon = lon - dLon; maxLon = lon;
  }
  
  const p1_lat = minLat + Math.random() * (maxLat - minLat);
  const p1_lon = minLon + Math.random() * (maxLon - minLon);
  const p2_lat = minLat + Math.random() * (maxLat - minLat);
  const p2_lon = minLon + Math.random() * (maxLon - minLon);
  const p3_lat = minLat + Math.random() * (maxLat - minLat);
  const p3_lon = minLon + Math.random() * (maxLon - minLon);

  return {
    type: "LineString",
    coordinates: [
      [p1_lon, p1_lat],
      [p2_lon, p2_lat],
      [p3_lon, p3_lat]
    ]
  };
}

async function main() {
  console.log('--- STARTING SCALABLE NATIONWIDE SEED ---');
  console.log('Clearing existing database tables...');
  await prisma.$transaction([
    prisma.trafficData.deleteMany(),
    prisma.road.deleteMany(),
    prisma.weatherData.deleteMany(),
    prisma.aqiReading.deleteMany(),
    prisma.forecastResult.deleteMany(),
    prisma.station.deleteMany(),
    prisma.hotspot.deleteMany(),
    prisma.intervention.deleteMany(),
    prisma.zone.deleteMany()
  ]);

  console.log('Database tables cleared successfully.');

  // Arrays to hold all records to insert
  const zonesToInsert: any[] = [];
  const stationsToInsert: any[] = [];
  const roadsToInsert: any[] = [];

  // Maps for memory references
  const stationToRoadMap: Record<string, string> = {};
  const cityInfoMap: Record<string, typeof CITIES_DATA[0]> = {};

  let zoneCounter = 1;
  let roadIndex = 1;

  console.log(`Generating in-memory metadata for ${CITIES_DATA.length} cities...`);

  for (const cityData of CITIES_DATA) {
    const [city, state, region, lat, lon, size, aqiBase, tempBase, humBase, windBase, rainBase] = cityData;
    cityInfoMap[city] = cityData;

    // Determine counts based on city category
    let stationCount = 3;
    if (size === 'METRO') stationCount = 18;
    else if (size === 'TIER2') stationCount = 9;

    // Create 4 zones per city in-memory
    const cityZones: any[] = [];
    for (let zoneIndex = 0; zoneIndex < 4; zoneIndex++) {
      const zoneId = randomUUID();
      const zoneCode = `ZONE_${zoneCounter.toString().padStart(4, '0')}`;
      const zoneName = `${city} Ward-${zoneIndex + 1}`;
      const geometry = generateZonePolygon(lat, lon, zoneIndex);

      const zoneObj = {
        id: zoneId,
        zoneCode,
        zoneName,
        city,
        geometry
      };
      zonesToInsert.push(zoneObj);
      cityZones.push(zoneObj);
      zoneCounter++;
    }

    // Generate unique stations for this city in-memory
    const shuffledNeighborhoods = shuffleArray(NEIGHBORHOODS);
    for (let sIndex = 0; sIndex < stationCount; sIndex++) {
      const neighborhood = shuffledNeighborhoods[sIndex % shuffledNeighborhoods.length];
      const stationName = `${city} ${neighborhood}`;
      const stationCode = generateUniqueCode(city);
      const stationId = randomUUID();

      const quadrantIndex = sIndex % 4;
      const targetZone = cityZones[quadrantIndex];

      const dLat = 0.04;
      const dLon = 0.04;
      let offsetLat = Math.random() * dLat;
      let offsetLon = Math.random() * dLon;
      if (quadrantIndex === 1) offsetLon = -offsetLon;
      else if (quadrantIndex === 2) offsetLat = -offsetLat;
      else if (quadrantIndex === 3) {
        offsetLat = -offsetLat;
        offsetLon = -offsetLon;
      }

      const stationLat = lat + offsetLat;
      const stationLon = lon + offsetLon;

      stationsToInsert.push({
        id: stationId,
        stationCode,
        stationName,
        city,
        state,
        latitude: stationLat,
        longitude: stationLon
      });

      // Create a Road segment inside the target zone associated with this station
      const roadNames = ['MG Road', 'Linking Road', 'Main Arterial', 'Highway Link', 'Ring Road', 'Bypass Road', 'Station Road', 'Civil Lines'];
      const selectedRoadName = `${city} ${roadNames[sIndex % roadNames.length]}`;
      const roadCode = `RD_${roadIndex.toString().padStart(4, '0')}`;
      const roadId = randomUUID();
      const roadGeometry = generateRoadLineString(lat, lon, quadrantIndex);
      
      roadsToInsert.push({
        id: roadId,
        roadCode,
        roadName: selectedRoadName,
        geometry: roadGeometry,
        zoneId: targetZone.id
      });

      stationToRoadMap[stationId] = roadId;
      roadIndex++;
    }
  }

  // Bulk insert Wards, Stations, and Roads in single transactions
  console.log('Inserting Ward (Zone) records in bulk...');
  await prisma.zone.createMany({ data: zonesToInsert });
  
  console.log('Inserting Monitoring Station records in bulk...');
  await prisma.station.createMany({ data: stationsToInsert });
  
  console.log('Inserting Road segment records in bulk...');
  await prisma.road.createMany({ data: roadsToInsert });

  console.log(`Successfully batch inserted metadata: ${zonesToInsert.length} zones, ${stationsToInsert.length} stations, and ${roadsToInsert.length} roads.`);

  // Time metrics
  const now = new Date();
  const startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
  const intervalMs = (30 * 24 * 60 * 60 * 1000) / 1000;

  console.log('Starting parallel-batched readings seeding (Chunk size = 3 stations, 6 concurrent workers)...');

  const batchSize = 3;
  const batches: any[][] = [];
  for (let i = 0; i < stationsToInsert.length; i += batchSize) {
    batches.push(stationsToInsert.slice(i, i + batchSize));
  }

  let nextBatchIndex = 0;
  let seededCount = 0;

  async function worker() {
    while (true) {
      const batchIdx = nextBatchIndex++;
      if (batchIdx >= batches.length) {
        break;
      }
      const stationBatch = batches[batchIdx];

      const aqiBatch: any[] = [];
      const weatherBatch: any[] = [];
      const trafficBatch: any[] = [];
      const forecastBatch: any[] = [];

      for (const station of stationBatch) {
        const roadId = stationToRoadMap[station.id];
        const cityData = cityInfoMap[station.city];
        const [,, region, , , size, aqiBase, tempBase, humBase, windBase, rainBase] = cityData;

        let lastObservedAqi = aqiBase;
        for (let step = 0; step < 1000; step++) {
          const timestamp = new Date(startTime.getTime() + step * intervalMs);
          const hour = timestamp.getHours();
          const isRushHour = (hour >= 7 && hour <= 10) || (hour >= 17 && hour <= 21);

          // 1. AQI Readings
          const diurnalOffset = Math.sin(hour * Math.PI / 12) * 15;
          const rushHourOffset = isRushHour ? randomFloat(20, 50) : 0;
          const aqiValue = Math.max(15, Math.min(500, Math.round(aqiBase + diurnalOffset + rushHourOffset + randomFloat(-15, 15))));
          lastObservedAqi = aqiValue;

          const pm25 = randomFloat(aqiValue * 0.45, aqiValue * 0.7);
          const pm10 = randomFloat(pm25 * 1.3, pm25 * 2.1);
          const no2 = randomFloat(8, 30) + (isRushHour ? randomFloat(15, 45) : 0);
          const so2 = randomFloat(4, 20) + (size === 'METRO' ? randomFloat(4, 15) : 0);
          const co = randomFloat(0.2, 1.2) + (isRushHour ? randomFloat(0.4, 2.0) : 0);
          const o3 = randomFloat(12, 45) + (tempBase > 28 ? randomFloat(8, 35) : 0);
          const nh3 = randomFloat(2, 22);

          aqiBatch.push({
            stationId: station.id,
            timestamp,
            aqi: aqiValue,
            pm25,
            pm10,
            no2,
            so2,
            co,
            o3,
            nh3
          });

          // 2. Weather Data
          const tempOffset = Math.sin((hour - 6) * Math.PI / 12) * 5; 
          const temperature = tempBase + tempOffset + randomFloat(-1.5, 1.5);
          const humidity = Math.max(10, Math.min(100, humBase - tempOffset * 2.5 + randomFloat(-4, 4)));
          const windSpeed = Math.max(0, windBase + Math.sin((hour - 12) * Math.PI / 12) * 2 + randomFloat(-1.5, 1.5));
          const windDirection = Math.abs((180 + Math.sin(step * Math.PI / 80) * 80 + randomFloat(-12, 12)) % 360);
          const pressure = 1013 - (temperature - 20) * 0.45 + randomFloat(-1, 1);
          
          let rainfall = 0;
          const isRainyRegion = ['South', 'East', 'North-East'].includes(region);
          const rainProbability = isRainyRegion ? (rainBase / 350) : (rainBase / 800);
          if (Math.random() < rainProbability) {
            rainfall = randomFloat(0.5, 25);
          }

          weatherBatch.push({
            stationId: station.id,
            timestamp,
            temperature,
            humidity,
            windSpeed,
            windDirection,
            pressure,
            rainfall
          });

          // 3. Traffic Data
          let congestionScore = Math.round(randomFloat(15, 45));
          let vehicleCount = Math.floor(randomFloat(80, 200));
          let averageSpeed = randomFloat(30, 48);

          if (isRushHour) {
            congestionScore = Math.round(randomFloat(65, 95));
            vehicleCount = Math.floor(randomFloat(350, 750));
            averageSpeed = randomFloat(10, 22);
          } else if (hour >= 23 || hour <= 5) {
            congestionScore = Math.round(randomFloat(5, 18));
            vehicleCount = Math.floor(randomFloat(10, 65));
            averageSpeed = randomFloat(55, 75);
          }

          trafficBatch.push({
            roadId,
            latitude: station.latitude + randomFloat(-0.003, 0.003),
            longitude: station.longitude + randomFloat(-0.003, 0.003),
            congestionScore,
            averageSpeed,
            vehicleCount,
            timestamp
          });
        }

        // 4. Forecast Results
        const horizons = [
          { hours: 24, type: '24h', confidence: 0.88 },
          { hours: 48, type: '48h', confidence: 0.78 },
          { hours: 72, type: '72h', confidence: 0.68 }
        ];

        const getAqiCategory = (val: number) => {
          if (val <= 50) return 'Good';
          if (val <= 100) return 'Moderate';
          if (val <= 150) return 'Poor';
          if (val <= 200) return 'Unhealthy';
          return 'Severe';
        };

        const getRiskLevel = (val: number) => {
          if (val <= 100) return 'LOW';
          if (val <= 150) return 'MODERATE';
          if (val <= 200) return 'HIGH';
          return 'SEVERE';
        };

        for (const horizon of horizons) {
          const forecastAQI = Math.max(15, Math.min(500, Math.round(lastObservedAqi + randomFloat(-35, 35))));
          const forecastDate = new Date(now.getTime() + horizon.hours * 60 * 60 * 1000);
          forecastBatch.push({
            stationId: station.id,
            forecastAQI,
            confidence: horizon.confidence,
            category: getAqiCategory(forecastAQI),
            riskLevel: getRiskLevel(forecastAQI),
            forecastType: horizon.type,
            modelVersion: 'v1.0-production',
            forecastDate
          });
        }
      }

      await prisma.aqiReading.createMany({ data: aqiBatch });
      await prisma.weatherData.createMany({ data: weatherBatch });
      await prisma.trafficData.createMany({ data: trafficBatch });
      await prisma.forecastResult.createMany({ data: forecastBatch });

      seededCount += stationBatch.length;
      console.log(`[SEED PROGRESS] Seeded readings for ${seededCount}/${stationsToInsert.length} stations...`);
    }
  }

  const numWorkers = 6;
  const workerPromises = Array.from({ length: numWorkers }, () => worker());
  await Promise.all(workerPromises);

  console.log('AQI, Weather, Traffic, and Forecast timelines seeded successfully.');

  // Generate hotspots and interventions
  console.log('Generating Hotspots and Interventions records...');

  const hotspotData: any[] = [];
  const interventionData: any[] = [];

  for (const zone of zonesToInsert) {
    const cityData = cityInfoMap[zone.city];
    const [,, , lat, lon, , aqiBase] = cityData;

    // Generate 3 historical hotspots for this zone
    for (let hIdx = 0; hIdx < 3; hIdx++) {
      const hAqi = Math.max(100, Math.round(aqiBase + randomFloat(20, 100)));
      const severity = hAqi >= 300 ? 'CRITICAL' : hAqi >= 200 ? 'HIGH' : hAqi >= 120 ? 'MEDIUM' : 'LOW';
      
      const pastDate = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000);
      hotspotData.push({
        zoneId: zone.id,
        latitude: lat + randomFloat(-0.02, 0.02),
        longitude: lon + randomFloat(-0.02, 0.02),
        aqi: hAqi,
        pm25: hAqi * 0.6,
        pm10: hAqi * 1.4,
        stationCount: 1 + Math.floor(Math.random() * 3),
        radius: randomFloat(0.01, 0.04),
        severity,
        detectedAt: pastDate
      });
    }

    // Generate 3 interventions for this zone
    for (let iIdx = 0; iIdx < 3; iIdx++) {
      const template = INTERVENTION_TEMPLATES[iIdx % INTERVENTION_TEMPLATES.length];
      const currentZoneAqi = Math.round(aqiBase + randomFloat(-10, 30));
      const postAqi = Math.round(currentZoneAqi * (1 - template.reductionPct));
      const pastDate = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000);

      interventionData.push({
        zoneId: zone.id,
        priority: template.priority,
        riskLevel: template.riskLevel,
        title: template.title,
        description: template.description,
        recommendedActions: template.recommendedActions,
        estimatedAQIReduction: template.reduction,
        postInterventionAQI: postAqi,
        confidenceScore: randomFloat(0.72, 0.94),
        createdAt: pastDate,
        expectedImpact: `Reduces localized particulate concentrations by ${template.reduction} within 3 hours.`
      });
    }
  }

  // Insert hotspots and interventions in single batches
  await prisma.hotspot.createMany({ data: hotspotData });
  await prisma.intervention.createMany({ data: interventionData });

  console.log(`Seeded ${hotspotData.length} hotspots and ${interventionData.length} interventions.`);
  console.log('--- NATIONWIDE SEEDING COMPLETED SUCCESSFULLY ---');
}

main()
  .catch((e) => {
    console.error('Error during database seed execution:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
