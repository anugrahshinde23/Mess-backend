import { generateImage } from "../services/image.services.js"

export const generateImageFromPrompt = async (req,res) => {
    try {
        const {prompt} = req.body
        const data = await generateImage(prompt)

        return res.status(200).json({
            success : true,
            message : "Successfully generated image",
            imageURL : data
        })
    } catch (error) {
        console.log(error.response.status)

  const msg = Buffer.from(error.response.data).toString()
  console.log(msg)
        return res.status(400).json({
            success : false,
            message : error.message
        })
    }
}