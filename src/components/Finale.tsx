import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { team, type Member } from '../data'
import { Logo, TelegramIcon } from './icons'

const ease = [0.22, 1, 0.36, 1] as const
const YEAR = new Date().getFullYear()
const row = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.09 } },
}
const item = {
  hidden: { opacity: 0, y: 30 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.8, ease } },
}

function Member({ member }: { member: Member }) {
  return (
    <motion.li className={`lineup__item lineup__item--${member.tier}`} variants={item}>
      <div className="lineup__figure">
        <img src={member.avatar} alt={`${member.firstName} ${member.lastName}`} loading="lazy" draggable={false} />
      </div>
      <div className="lineup__info">
        <h3 className="lineup__name">
          {member.firstName}
          <span>{member.lastName}</span>
        </h3>
        <span className={`badge badge--${member.tier}`}>{member.role}</span>
        <a
          className="tg-btn"
          href={member.telegram}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Написать ${member.firstName} в Telegram`}
        >
          <TelegramIcon />
        </a>
      </div>
    </motion.li>
  )
}

export function Finale() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end end'] })
  const auroraY = useTransform(scrollYProgress, [0, 1], [-160, 80])
  const auroraY2 = useTransform(scrollYProgress, [0, 1], [120, -120])

  return (
    <section ref={ref} className="finale">
      <div className="finale__bg" aria-hidden="true">
        <motion.div className="aurora aurora--a" style={{ y: auroraY }} />
        <motion.div className="aurora aurora--b" style={{ y: auroraY2 }} />
      </div>

      <motion.header
        className="finale__head"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 1, ease }}
      >
        <p className="eyebrow">Вся команда в сборе</p>
        <h2 className="finale__title">
          Вместе мы — <span className="accent-text">техподдержка pay.digital</span>
        </h2>
      </motion.header>

      {/* Вся команда в один ряд на одной линии пола; на узком экране — горизонтальный скролл со snap. */}
      <div className="lineup">
        <motion.ul className="lineup__track" variants={row} initial="hidden" whileInView="shown" viewport={{ once: true, amount: 0.2 }}>
          {team.map((m) => (
            <Member key={m.id} member={m} />
          ))}
        </motion.ul>
      </div>

      <motion.footer
        className="finale__foot"
        initial={{ opacity: 0, scale: 0.92 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 1.1, ease }}
      >
        <div className="finale__logo">
          <span className="hero__logo-glow" aria-hidden="true" />
          <Logo />
        </div>
        <p>Мы всегда на связи</p>
        <p className="copyright">© {YEAR} pay.digital. Все права защищены.</p>
        <a className="credit" href="https://t.me/i_am_ObeOne" target="_blank" rel="noopener noreferrer">
          ObeOne
        </a>
      </motion.footer>
    </section>
  )
}
