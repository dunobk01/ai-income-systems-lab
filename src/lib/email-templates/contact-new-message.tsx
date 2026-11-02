import React from 'react'
import { Body, Button, Container, Head, Heading, Html, Preview, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'

interface Props {
  name?: string
  email?: string
  subject?: string
  message?: string
  isFollowUp?: boolean
}

const ContactNewMessage = ({ name, email, subject, message, isFollowUp }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{isFollowUp ? 'New reply in your contact inbox' : 'New contact message'}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>{isFollowUp ? 'New reply' : 'New contact message'}: {subject ?? ''}</Heading>
        <Text style={text}>From: {name ?? 'Unknown'} ({email ?? ''})</Text>
        <Text style={text}>{(message ?? '').slice(0, 600)}</Text>
        <Button href="https://ai-income-systems.com/admin/inbox" style={button}>Open admin inbox</Button>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: ContactNewMessage,
  subject: (d: Record<string, any>) => `${d.isFollowUp ? 'New reply' : 'New message'}: ${d.subject ?? 'Contact form'}`,
  displayName: 'Contact inbox notification (to owner)',
  to: 'aiincomesystemslab@gmail.com',
  previewData: { name: 'Jane', email: 'jane@example.com', subject: 'Question', message: 'Hi, what does Builder include?' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { padding: '24px 25px' }
const h1 = { fontSize: '20px', color: '#111111' }
const text = { fontSize: '14px', color: '#333333', lineHeight: '1.6', whiteSpace: 'pre-wrap' as const }
const button = { backgroundColor: '#d4a72c', color: '#111111', padding: '10px 18px', borderRadius: '10px', fontWeight: 700, textDecoration: 'none' }
