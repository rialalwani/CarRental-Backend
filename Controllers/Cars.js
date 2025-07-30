import mongoose from "mongoose";
import CarImages from "../Models/image.js"
import { v2 } from "cloudinary"
import dotenv from "dotenv"
import fs from "fs"

dotenv.config()

v2.config({
    cloud_name: process.env.CLOUD,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
})

export const uploadimage = async (req, res) => {
    /*if(err)
        return res.status(404).json(err.message)*/
    const {email}=req.user
    if(email!==process.env.EMAIL_ID)
        return res.status(401).json("Unauthorized user")

    try {
        const result = await v2.uploader.upload(req.file.path)
        fs.unlinkSync(req.file.path)

        const imagefile = new CarImages({
            url: result.secure_url,
            public_id: result.public_id,
            carname: req.body.carname,
            cardesc: req.body.cardesc,
            filename: req.file.originalname,
            filetype: req.file.mimetype,
            filepath: req.file.path,
            filesize: req.file.size,
            price: req.body.price
        })

        await imagefile.save()
        return res.status(200).json("Image Uploaded successfully")
    }
    catch (error) {
        return res.status(404).json(error.message)
    }
}

export const getImages = async (req, res) => {
    try {
        const images = await CarImages.find()
        return res.status(200).json(images)
    }
    catch (error) {
        return res.status(404).json(error.message)
    }
}

export const updateImage = async (req, res) => {
    try {
        const {email}=req.user
        if(email!==process.env.EMAIL_ID)
        return res.status(401).json("Unauthorized user")

        const { _id } = req.body
        const imageData = await CarImages.findById({ _id })
        if (!imageData) {
            fs.unlinkSync(req.file.path)
            return res.status(404).json("Car does not exist")
        }

        const public_id = imageData.public_id
        const result = await v2.uploader.upload(req.file.path, { public_id: public_id, overwrite: true })
        imageData.url = result.secure_url,
            imageData.filename = req.file.originalname,
            imageData.filetype = req.file.mimetype,
            imageData.filepath = req.file.path,
            imageData.filesize = req.file.size,

            await imageData.save()
        return res.status(200).json("Image Updated successfully")
    }
    catch (error) {
        console.log(error.message)
        return res.status(404).json(error.message)
    }
}

export const updateImageData = async (req, res) => {
    const {email}=req.user
    if(email!==process.env.EMAIL_ID)
        return res.status(401).json("Unauthorized user")

    const { _id, price, carname, cardesc } = req.body
    console.log(req.body)

    try {
        const imageData = await CarImages.findById(_id)
        if (!imageData)
            return res.status(404).json("Car does not exist")

        if (price)
            imageData.price = price
        if (carname)
            imageData.carname = carname
        if (cardesc)
            imageData.cardesc = cardesc

        await imageData.save()
        return res.status(200).json("Image Updated successfully")
    }
    catch (error) {
        console.log(error.message)
        return res.status(404).json(error.message)
    }
}

export const deleteImage = async (req, res) => {

    const {email}=req.user
    if(email!==process.env.EMAIL_ID)
        return res.status(401).json("Unauthorized user")

    const { _id } = req.body
    const imageData = await CarImages.findById({ _id })
    if (!imageData)
        return res.status(404).json("car does not exist")

    const public_id = imageData.public_id
    try {
        const result = await v2.uploader.destroy(public_id)
        await CarImages.deleteOne({ _id })
        return res.status(200).json("Image Deleted successfully")
    }
    catch (error) {
        console.log(error.message)
        return res.status(404).json(error.message)
    }
}

export const updateAvailability = async (req, res) => {

    const {email}=req.user
    if(email!==process.env.EMAIL_ID)
        return res.status(401).json("Unauthorized user")

    const { _id } = req.body
    try {
        const imageData = await CarImages.findById({ _id })
        if (!imageData)
            return res.status(404).json("Car does not exist")

        if (imageData.availability === "Available") 
        imageData.availability = "Not Available"
        else
        imageData.availability = "Available"

        await imageData.save()
        return res.status(200).json("Car is not available for booking")
    }
    catch (error) {
        console.log(error.message)
        return res.status(404).json(error.message)
    }
}
