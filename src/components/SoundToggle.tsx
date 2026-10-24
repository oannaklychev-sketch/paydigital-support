import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { sound } from '../audio/sound'

// Кнопка звука. Браузеры не дают сайту включать звук без действия пользователя, поэтому по умолчанию выключено.
export function SoundToggle() {
  const [on, setOn] = useState(sound.on)
  useEffect(() => {
    const off = sound.subscribe(setOn)
    return () => {
      off()
    }
  }, [])

  return (
    <motion.button
      type="button"
      className={`sound-toggle${on ? ' is-on' : ''}`}
      onClick={() => sound.toggle()}
      aria-pressed={on}
      aria-label={on ? 'Выключить звук' : 'Включить звук'}
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.8, duration: 0.8 }}
    >
      <span className="sound-toggle__bars" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </span>
      <span className="sound-toggle__label">{on ? 'Звук включён' : 'Включить звук'}</span>
    </motion.button>
  )
}
