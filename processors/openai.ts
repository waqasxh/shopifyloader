import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Ensure you set your API key in your environment variables
  baseURL: "https://api.openai.com/v1", // Set your desired base URL
});

export async function categoryConfirmation(product: any): Promise<any> {
  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content:
          "You are a digital marketing and copy writting exper and has ability to write 100% unique SEO optimised article like human.",
      },
      {
        role: "user",
        content: `A product having title "${product.Title}" and description "${product.ShortDescription}" belong to category ${product.Category}, I need reply as true false without and further explanation, in case given description or title sounds like adult product please provide response as false.`,
      },
    ],
  });

  return completion.choices[0].message;
}

export async function seoFriendlyTitle(product: any): Promise<any> {
  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: "You are an ecommerce expert." },
      {
        role: "user",
        content: `Convert this provided title "${product.Title}" into SEO Friendly Product Title for an ecommerce store.`,
      },
    ],
  });

  return completion.choices[0].message;
}

export async function seoFriendlyDescription(product: any): Promise<any> {
  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content:
          "You are a digital marketing and copy writting exper and has ability to write 100% unique SEO optimised article like human.",
      },
      {
        role: "user",
        content: `Convert this provided description "${product.ShortDescription}" into SEO Friendly Product Description for an ecommerce store.`,
      },
    ],
  });

  return completion.choices[0].message;
}
