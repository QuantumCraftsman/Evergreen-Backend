import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        console.log("Multer destination function called");  // Log when destination is set
        cb(null, "./public/temp");  // Ensure this path exists!
    },
    filename: function (req, file, cb) {
        console.log("Multer filename function called");
        console.log(`Original filename: ${file.originalname}`);  // Log the original file name
        
        cb(null, file.originalname);  // Use original name as file name
    }
});

// Log when the multer middleware is initialized
console.log("Multer middleware loaded");

export const upload = multer({ 
    storage, 
});
//write a method