import React from 'react'
import { Body, Button, Container, Head, Heading, Html, Preview, Section, Text, Hr } from '@react-email/components'
import type { TemplateEntry } from './registry'

interface Props {
  name?: string
  subject?: string
  threadUrl?: string
}

const ContactConfirmation = ({ name, subject, threadUrl }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>We got your message — thanks for reaching out</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>AI Income Systems Lab</Text>
        <Heading style={h1}>Message received</Heading>
        <Text style={text}>{name ? `Hi ${name},` : 'Hi there,'}</Text>
        <Text style={text}>
          Thanks for reaching out — your message{' '}
          {subject ? (
            <>
              about <strong style={strong}>“{subject}”</strong>
            </>
          ) : (
            <strong style={strong}>came through</strong>
          )}{' '}
          and is now in my inbox. I read every message myself and will reply to you soon.
        </Text>
        <Section style={note}>
          <Text style={noteText}>
            No need to send it again. If you think of something else, use the link below and
            add it to the same conversation — it comes straight to me.
          </Text>
        </Section>
        {threadUrl ? (
          <>
            <Hr style={hr} />
            <Text style={small}>Keep this email — my reply will arrive from this same conversation.</Text>
            <Button href={threadUrl} style={button}>View your conversation</Button>
          </>
        ) : null}
        <Text style={signoff}>— Dustin, AI Income Systems Lab</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: ContactConfirmation,
  subject: (d: Record<string, any>) =>
    d.subject ? `We got your message: ${d.subject}` : 'We got your message',
  displayName: 'Contact form confirmation (to visitor)',
  previewData: {
    name: 'Jane',
    subject: 'Question about Builder',
    threadUrl: 'https://ai-income-systems.com/contact/r/example',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { padding: '28px 25px', maxWidth: '560px' }
const brand = { color: '#b8901f', fontSize: '13px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const }
const h1 = { fontSize: '22px', color: '#111111', margin: '8px 0 16px' }
const text = { fontSize: '15px', color: '#333333', lineHeight: '1.6' }
const strong = { color: '#111111' }
const note = { borderLeft: '3px solid #d4a72c', padding: '4px 0 4px 14px', margin: '16px 0' }
const noteText = { fontSize: '14px', color: '#444444', lineHeight: '1.6', margin: '0' }
const hr = { borderColor: '#eeeeee', margin: '24px 0' }
const small = { fontSize: '13px', color: '#666666' }
const signoff = { fontSize: '15px', color: '#333333', marginTop: '18px' }
const button = { backgroundColor: '#d4a72c', color: '#111111', padding: '12px 20px', borderRadius: '10px', fontWeight: 700, textDecoration: 'none' }
