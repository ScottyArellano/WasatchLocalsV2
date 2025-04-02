export const productColorMap = {
    "Baked Goods": "#000000", // Black
    "Home Made": "#4285F4",      // Blue
    "Dairy": "#000000",
    "Beef": "#A52A2A",                    // Brown
    "Meat Chickens": "#FFA500",                 // Orange
    "Eggs": "#FFFFFF",                    // White
    "Veggies": "#006400",                 // Dark Green
    "Fruit": "#FF0000",                   // Red
    "Other": "#800080",                  // Purple
    "Pork": "#FFC0CB"                     // Pink
};


// Array to hold data for farms
export const farms = [
    
    {
        id: 1,
        name: "Francis Family Farms",
        location: [-111.4646855, 40.525671], // Longitude, Latitude
        products: ["Veggies","Flowers"],
        bio: "Local U-Pick Farm",
        phone:"+1-801-842-6765",
        website: "https://francisfamilyfarms.com/",
        photos:[
            "images/id1/photo1.jpg",
            "images/id1/photo2.jpg",
            "images/id1/photo3.jpg",
            "images/id1/photo4.jpg",
            "images/id1/photo5.jpg"
        ]
       
    },
    {
        id: 2,
        name: "Terestrial Academy Farms",
        location: [-111.472052,40.474732], // Longitude, Latitude
        products: ["Eggs","Meat Chickens"],
        bio: "We believe in the offering food the way God intended. Our eggs and pastured meat chickens are raised on 100% grass, fed a 100% organic diet.",
        phone:"+1-925-918-3518",
        website: "https://terestrial.com",
        photos:[
            "images/id2/photo1.jpg",
            "images/id2/photo2.jpg",
            "images/id2/photo3.jpg"
 
        ]
        
    },

]
  