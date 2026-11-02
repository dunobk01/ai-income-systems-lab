import React from 'react'
import { Body, Button, Container, Head, Heading, Html, Preview, Section, Text, Hr } from '@react-email/components'
import type { TemplateEntry } from './registry'

interface Props {
  name?: string
  subject?: string
  reply?: string
  threadUrl?: string
}

const ContactReply = ({ name, subject, reply, threadUrl }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>A reply to your message from AI Income Systems Lab</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>AI Income Systems Lab</Text>
        <Heading style={h1}>{subject ? `Re: ${subject}` : 'We replied to your message'}</Heading>
        <Text style={text}>{name ? `Hi ${name},` : 'Hi there,'}</Text>
        <Section style={quote}>
          {(reply ?? '').split('\n').map((line, i) => (
            <Text key={i} style={replyText}>{line || '\u00a0'}</Text>
          ))}
        </Section>
        <Text style={text}>— Dustin, AI Income Systems Lab</Text>
        {threadUrl ? (
          <>
            <Hr style={hr} />
            <Text style={small}>To respond, use the button below so your reply reaches us directly.</Text>
            <Button href={threadUrl} style={button}>View and reply</Button>
          </>
        ) : null}
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: ContactReply,
  subject: (d: Record<string, any>) => (d.subject ? `Re: ${d.subject}` : 'A reply from AI Income Systems Lab'),
  displayName: 'Contact reply',
  previewData: { name: 'Jane', subject: 'Question about Builder', reply: 'Thanks for reaching out!\n\nBuilder includes Module 12.', threadUrl: 'https://ai-income-systems.com/contact/r/example' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { padding: '28px 25px', maxWidth: '560px' }
const brand = { color: '#b8901f', fontSize: '13px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const }
const h1 = { fontSize: '22px', color: '#111111', margin: '8px 0 16px' }
const text = { fontSize: '15px', color: '#333333', lineHeight: '1.6' }
const quote = { borderLeft: '3px solid #d4a72c', padding: '4px 0 4px 14px', margin: '12px 0' }
const replyText = { fontSize: '15px', color: '#222222', lineHeight: '1.6', margin: '0' }
const hr = { borderColor: '#eeeeee', margin: '24px 0' }
const small = { fontSize: '13px', color: '#666666' }
const button = { backgroundColor: '#d4a72c', color: '#111111', padding: '12px 20px', borderRadius: '10px', fontWeight: 700, textDecoration: 'none' }
