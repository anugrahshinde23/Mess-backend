


export const generateImage = async (prompt) => {

    const encodedPrompt = encodeURIComponent(prompt)
  
    const imageURL = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024`
  
    return imageURL
  }
