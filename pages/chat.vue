<script setup lang="ts">
import type { StreamTextOptions } from '@xsai/stream-text'
import { streamText } from '@xsai/stream-text'
import { smoothStream } from '@xsai/utils-stream'

const stream = shallowRef<ReadableStream>()

const input = shallowRef('')

const options: StreamTextOptions = {
  apiKey: import.meta.env.CHAT_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
  messages: [
    {
      content: 'You\'re a helpful assistant.',
      role: 'system',
    },

  ],
  // model: 'deepseek/deepseek-chat-v3-0324:free',
  model: 'qwen/qwen3-1.7b:free',
}

async function send() {
  try {
    const { textStream } = await streamText({
      ...options,
      messages: [
        ...options.messages,
        {
          content: input.value,
          role: 'user',
        },
      ],
    })
    stream.value = textStream.pipeThrough(smoothStream({
      delay: 20,
      chunking: 'word',
    }))
  }
  catch (error) {
    console.error('error', error)
  }
}
</script>

<template>
  <div p4>
    <ChatText v-if="stream" :stream="stream">
      <div flex="~ items-center gap2">
        <Icon name="svg-spinners:90-ring-with-bg" /> Waiting for response...
      </div>
    </ChatText>
    <div relative w-full>
      <textarea
        v-model="input" placeholder="Enter text here, press <Ctrl+Enter> to send message" w-full outline-none border rounded p2
        min-h-20
        @keydown.ctrl.enter="send"
      />
      <button :disabled="!input" absolute right-2 bottom-3 border rounded p2 bg-neutral-100 op50 hover:op100 @click="send">
        send
      </button>
    </div>
  </div>
</template>
