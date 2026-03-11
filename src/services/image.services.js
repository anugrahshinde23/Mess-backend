import axios from 'axios'


export const generateImage = async (prompt) => {

        const res = await axios.post(
            "https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0",
            {
                inputs : prompt
            },
            {
                headers : {
                    Authorization : `Bearer ${process.env.HUGGINGFACEHUB_API_TOKEN}`,
                    "Content-Type" : "application/json",
                    Accept : 'image/png'
                },
                responseType : "arraybuffer"
            }

        )

        const base64Image = Buffer.from(res.data).toString("base64")

  return `data:image/png;base64,${base64Image}`

}