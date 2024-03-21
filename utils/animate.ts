import type { Illustration } from 'zdog'

export function rotateIlloZ(illo: Illustration, speed = 0.03) {
  illo.rotate.y += speed
  illo.updateRenderGraph()
  requestAnimationFrame(() => rotateIlloZ(illo))
}
