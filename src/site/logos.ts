import cursor from '@/assets/logos/cursor.svg'
import deepseek from '@/assets/logos/deepseek.svg'
import gemma from '@/assets/logos/gemma.svg'
import glm from '@/assets/logos/chatglm.svg'
import meta from '@/assets/logos/meta.svg'
import mistral from '@/assets/logos/mistral.svg'
import openwebui from '@/assets/logos/openwebui.svg'
import qwen from '@/assets/logos/qwen.svg'
import sillytavern from '@/assets/logos/sillytavern.svg'

// Marks from lobehub/lobe-icons (MIT). Each is a trademark of its owner, shown to name the product.

/** The model families nodeny serves builds of. */
export const LOGOS = { meta, qwen, mistral, gemma, deepseek, glm } as const
export type Family = keyof typeof LOGOS

/** Clients shown in the integrations section. */
export const TOOLS = { openwebui, sillytavern, cursor } as const
