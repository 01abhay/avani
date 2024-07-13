import OpenAI from 'openai'

const openai = new OpenAI()

export const embeddings = async (input: string[]) => {
  const res = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input,
    encoding_format: 'float',
  })
  return res.data
}

export const vision = async (text: string, image_urls: string[]) => {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text },
          ...image_urls.map(
            i =>
              ({
                type: 'image_url',
                image_url: { url: i, detail: 'low' },
              }) as const,
          ),
        ],
      },
    ],
  })
  return response.choices[0]!
}

export const completion = (messages: { role: 'user' | 'assistant' | 'system'; content: string }[] = []) => {
  const systemPrompt = `You are a sales agent on an e-commerce platform, your job is to reply to customer queries just as a real life sales agent would.
    You will be given relevant info about the products and policies if and when required to be used to answer a query appropriately.
    you must try to reply within 120 words.

    please respond in plain text instead of markdown format.`

  return openai.chat.completions.create({
    model: 'gpt-3.5-turbo-0125',
    messages: [{ role: 'system', content: systemPrompt }, ...messages],
    max_tokens: 512,
  })
}
