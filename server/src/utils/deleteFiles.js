import fs from "fs";
export const deleteFile = async (fileName) => {
    const file = "public\\temp\\" + fileName;
    fs.unlinkSync(file);
};
