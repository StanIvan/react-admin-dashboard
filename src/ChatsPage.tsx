import { useEffect, useMemo, useState, type FormEvent } from 'react'
import {
  ArrowLeft,
  Check,
  MessageCircle,
  Plus,
  Search,
  Send,
  Users,
  X,
} from 'lucide-react'
import './ChatsPage.css'

type Message = {
  id: string
  sender: 'you' | 'them'
  text: string
  sentAt: number
}

type Conversation = {
  id: string
  name: string
  role: string
  messages: Message[]
  unread: number
}

const storageKey = 'northstar-dashboard-conversations'

const initialConversations: Conversation[] = [
  { id: 'c-olivia', name: 'Olivia Rhye', role: 'Product designer', unread: 2, messages: [{ id: 'ol-1', sender: 'them', text: 'I added a first pass of the updated onboarding screens. Could you take a look when you have a moment?', sentAt: Date.now() - 1000 * 60 * 54 }, { id: 'ol-2', sender: 'you', text: 'Absolutely, I’ll review them this afternoon.', sentAt: Date.now() - 1000 * 60 * 49 }, { id: 'ol-3', sender: 'them', text: 'Perfect, thank you! I also left notes on the project board.', sentAt: Date.now() - 1000 * 60 * 16 }] },
  { id: 'c-phoenix', name: 'Phoenix Baker', role: 'Engineering lead', unread: 0, messages: [{ id: 'ph-1', sender: 'them', text: 'The staging build is ready for a quick review.', sentAt: Date.now() - 1000 * 60 * 60 * 2 }, { id: 'ph-2', sender: 'you', text: 'I’ll check it before stand-up tomorrow.', sentAt: Date.now() - 1000 * 60 * 60 * 1.8 }] },
  { id: 'c-lana', name: 'Lana Steiner', role: 'Product manager', unread: 1, messages: [{ id: 'la-1', sender: 'you', text: 'Do we have an update on the research interviews?', sentAt: Date.now() - 1000 * 60 * 60 * 5 }, { id: 'la-2', sender: 'them', text: 'Three are complete. I’ll add the summary to the project later today.', sentAt: Date.now() - 1000 * 60 * 60 * 4.5 }] },
  { id: 'c-demi', name: 'Demi Wilkinson', role: 'Researcher', unread: 0, messages: [{ id: 'de-1', sender: 'them', text: 'I found a few useful patterns in the latest feedback.', sentAt: Date.now() - 1000 * 60 * 60 * 24 }, { id: 'de-2', sender: 'you', text: 'Great, let’s go over them in our next check-in.', sentAt: Date.now() - 1000 * 60 * 60 * 23 }] },
  { id: 'c-candice', name: 'Candice Wu', role: 'Frontend developer', unread: 0, messages: [{ id: 'ca-1', sender: 'you', text: 'Thanks for taking the first pass at the responsive layout.', sentAt: Date.now() - 1000 * 60 * 60 * 28 }, { id: 'ca-2', sender: 'them', text: 'Happy to help. The small-screen styles are ready now.', sentAt: Date.now() - 1000 * 60 * 60 * 26 }] },
  { id: 'c-jordan', name: 'Jordan Lee', role: 'Operations', unread: 0, messages: [{ id: 'jo-1', sender: 'them', text: 'The planning notes are in the shared folder.', sentAt: Date.now() - 1000 * 60 * 60 * 36 }] },
]

const contacts = [
  { id: 'c-olivia', name: 'Olivia Rhye', role: 'Product designer' },
  { id: 'c-phoenix', name: 'Phoenix Baker', role: 'Engineering lead' },
  { id: 'c-lana', name: 'Lana Steiner', role: 'Product manager' },
  { id: 'c-demi', name: 'Demi Wilkinson', role: 'Researcher' },
  { id: 'c-candice', name: 'Candice Wu', role: 'Frontend developer' },
  { id: 'c-jordan', name: 'Jordan Lee', role: 'Operations' },
  { id: 'c-riley', name: 'Riley Chen', role: 'Data analyst' },
  { id: 'c-sam', name: 'Sam Taylor', role: 'QA engineer' },
]

function isMessage(value: unknown): value is Message {
  if (typeof value !== 'object' || value === null) return false
  return 'id' in value && typeof value.id === 'string' &&
    'sender' in value && (value.sender === 'you' || value.sender === 'them') &&
    'text' in value && typeof value.text === 'string' &&
    'sentAt' in value && typeof value.sentAt === 'number'
}

function isConversation(value: unknown): value is Conversation {
  if (typeof value !== 'object' || value === null) return false
  return 'id' in value && typeof value.id === 'string' &&
    'name' in value && typeof value.name === 'string' &&
    'role' in value && typeof value.role === 'string' &&
    'unread' in value && typeof value.unread === 'number' &&
    'messages' in value && Array.isArray(value.messages) && value.messages.every(isMessage)
}

function loadConversations(): Conversation[] {
  try {
    const saved = window.localStorage.getItem(storageKey)
    if (!saved) return initialConversations
    const parsed: unknown = JSON.parse(saved)
    if (Array.isArray(parsed) && parsed.every(isConversation)) return parsed
    throw new Error('Saved conversation data has an unexpected format.')
  } catch (error) {
    console.error('Could not load saved conversations.', error)
    return initialConversations
  }
}

function initials(name: string) {
  return name.split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase()
}

function formatTime(timestamp: number) {
  return new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(timestamp)
}

function formatDay(timestamp: number) {
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(timestamp)
}

export function ChatsPage({ onNotify }: { onNotify: (message: string) => void }) {
  const [conversations, setConversations] = useState(loadConversations)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [messageDraft, setMessageDraft] = useState('')
  const [recipientQuery, setRecipientQuery] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(conversations))
    } catch (error) {
      console.error('Could not save conversations to local storage.', error)
      onNotify('Messages could not be saved in this browser.')
    }
  }, [conversations, onNotify])

  const filteredConversations = useMemo(() => conversations
    .filter((conversation) => `${conversation.name} ${conversation.role} ${conversation.messages.at(-1)?.text ?? ''}`.toLowerCase().includes(search.trim().toLowerCase()))
    .sort((first, second) => (second.messages.at(-1)?.sentAt ?? 0) - (first.messages.at(-1)?.sentAt ?? 0)), [conversations, search])

  const selected = conversations.find((conversation) => conversation.id === selectedId) ?? null
  const matchingContacts = contacts.filter((contact) =>
    !conversations.some((conversation) => conversation.id === contact.id) &&
    `${contact.name} ${contact.role}`.toLowerCase().includes(recipientQuery.trim().toLowerCase()),
  )

  function selectConversation(conversation: Conversation) {
    setSelectedId(conversation.id)
    setConversations((current) => current.map((item) => item.id === conversation.id ? { ...item, unread: 0 } : item))
  }

  function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const text = messageDraft.trim()
    if (!text || !selected) return
    const message: Message = { id: crypto.randomUUID(), sender: 'you', text, sentAt: Date.now() }
    setConversations((current) => current.map((conversation) => conversation.id === selected.id
      ? { ...conversation, messages: [...conversation.messages, message], unread: 0 }
      : conversation))
    setMessageDraft('')
  }

  function startConversation(contact: (typeof contacts)[number]) {
    const existing = conversations.find((conversation) => conversation.id === contact.id)
    if (existing) {
      selectConversation(existing)
    } else {
      setConversations((current) => [{ ...contact, unread: 0, messages: [] }, ...current])
      setSelectedId(contact.id)
    }
    setDialogOpen(false)
    setRecipientQuery('')
  }

  return (
    <section className={`chat-workspace${selected ? ' chat-has-selection' : ''}`}>
      <aside className="chat-inbox">
        <div className="chat-inbox-heading"><div><h2>Inbox</h2><span>{conversations.filter((conversation) => conversation.unread > 0).length} unread</span></div><button className="chat-new-button" aria-label="New message" onClick={() => { setRecipientQuery(''); setDialogOpen(true) }}><Plus size={17} /></button></div>
        <label className="chat-search"><Search size={15} /><input aria-label="Search conversations" placeholder="Search people or messages..." value={search} onChange={(event) => setSearch(event.target.value)} /></label>
        <div className="chat-contact-list">
          {filteredConversations.map((conversation) => {
            const lastMessage = conversation.messages.at(-1)
            return <button className={`chat-contact${selectedId === conversation.id ? ' selected' : ''}`} key={conversation.id} onClick={() => selectConversation(conversation)}>
              <span className={`chat-avatar chat-avatar-${conversation.name.charCodeAt(0) % 5}`}>{initials(conversation.name)}<i /></span>
              <span className="chat-contact-copy"><span className="chat-contact-top"><strong>{conversation.name}</strong><time>{lastMessage ? formatTime(lastMessage.sentAt) : ''}</time></span><span className="chat-contact-preview">{lastMessage ? `${lastMessage.sender === 'you' ? 'You: ' : ''}${lastMessage.text}` : 'Start a conversation'}</span></span>
              {conversation.unread > 0 && <span className="chat-unread">{conversation.unread}</span>}
            </button>
          })}
          {filteredConversations.length === 0 && <div className="chat-list-empty">No conversations found.</div>}
        </div>
      </aside>

      <div className="chat-thread">
        {selected ? <>
          <header className="chat-thread-header"><button className="chat-back-button" aria-label="Back to conversations" onClick={() => setSelectedId(null)}><ArrowLeft size={18} /></button><span className={`chat-avatar chat-avatar-${selected.name.charCodeAt(0) % 5}`}>{initials(selected.name)}<i /></span><div className="chat-thread-person"><strong>{selected.name}</strong><span>{selected.role}</span></div><span className="chat-local-badge"><Check size={12} /> Local chat</span></header>
          <div className="chat-message-list">
            {selected.messages.length === 0 ? <div className="chat-first-message"><span className="chat-first-icon"><MessageCircle size={20} /></span><strong>Start a conversation with {selected.name.split(' ')[0]}</strong><span>Messages are saved in this browser only.</span></div> : selected.messages.map((message, index) => {
              const previous = selected.messages[index - 1]
              const showDate = !previous || formatDay(previous.sentAt) !== formatDay(message.sentAt)
              return <div className="chat-message-group" key={message.id}>{showDate && <div className="chat-date-divider"><span>{formatDay(message.sentAt)}</span></div>}<div className={`chat-message-row${message.sender === 'you' ? ' own-message' : ''}`}><div className="chat-bubble">{message.text}<time>{formatTime(message.sentAt)}</time></div></div></div>
            })}
          </div>
          <form className="chat-composer" onSubmit={sendMessage}><input aria-label="Write a message" placeholder={`Message ${selected.name.split(' ')[0]}...`} value={messageDraft} onChange={(event) => setMessageDraft(event.target.value)} /><button type="submit" aria-label="Send message" disabled={!messageDraft.trim()}><Send size={16} /></button><span>Demo inbox · no message is sent outside this browser</span></form>
        </> : <div className="chat-welcome"><span className="chat-welcome-icon"><Users size={24} /></span><h2>Your team inbox</h2><p>Select a conversation to read messages, or start a new one with a teammate.</p><button className="task-primary-button" onClick={() => setDialogOpen(true)}><Plus size={15} /> New message</button></div>}
      </div>

      {dialogOpen && <div className="task-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setDialogOpen(false) }}><div className="task-modal chat-recipient-modal"><button className="task-modal-close" aria-label="Close dialog" onClick={() => setDialogOpen(false)}><X size={17} /></button><div className="task-modal-icon"><MessageCircle size={19} /></div><h2>New conversation</h2><p>Choose a teammate to open a private local chat.</p><label className="task-form-field">Search teammates<input autoFocus aria-label="Search teammates" value={recipientQuery} onChange={(event) => setRecipientQuery(event.target.value)} placeholder="Name or role..." /></label><div className="chat-recipient-list">{matchingContacts.map((contact) => <button key={contact.id} onClick={() => startConversation(contact)}><span className={`chat-avatar chat-avatar-${contact.name.charCodeAt(0) % 5}`}>{initials(contact.name)}</span><span><strong>{contact.name}</strong><small>{contact.role}</small></span></button>)}{matchingContacts.length === 0 && <span className="chat-no-recipients">No new teammates found.</span>}</div></div></div>}
    </section>
  )
}
