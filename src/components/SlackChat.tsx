import { useEffect, useRef, useState, useCallback } from 'react';

/* ───── Types ───── */
interface Attachment {
  type: 'info' | 'warning' | 'success';
  lines: string[];
}

interface AnimatedMessage {
  sender: string;
  avatar?: { initials: string; bg: string } | 'app';
  time: string;
  text: string;
  attachment?: Attachment;
  grouped?: boolean;
  reactions?: string[];
}

/* ───── Data ───── */
const STATIC_MESSAGES = [
  {
    sender: 'Transaction Agent',
    avatar: 'app' as const,
    time: '8:41 AM',
    text: 'Deal #4890 \u2014 55 Birch Ln: closing complete. File audited, all documents archived. \u2713 Closed',
  },
  {
    sender: 'Transaction Agent',
    avatar: 'app' as const,
    time: '9:02 AM',
    text: 'Deal #4891 \u2014 118 Oak Ave: all 12 deadlines on track. Next due: appraisal, Apr 11.',
  },
  {
    sender: 'Jake Martinez',
    avatar: { initials: 'JM', bg: '#4A7A62' },
    time: '9:08 AM',
    text: 'New listing agreement just signed for 742 Elm St. Contract coming through DocuSign now.',
  },
];

const ANIMATED_MESSAGES: AnimatedMessage[] = [
  {
    sender: 'Transaction Agent',
    avatar: 'app',
    time: '9:14 AM',
    text: 'New contract received via DocuSign. Parsed **14 deadlines** across 6 categories.',
    attachment: {
      type: 'info',
      lines: [
        'Deal #4892 \u2014 742 Elm St | Buyer: Rivera Family | Closing: May 9 | Status: 14/14 tracked',
      ],
    },
  },
  {
    grouped: true,
    sender: 'Transaction Agent',
    time: '9:14 AM',
    text: '',
    attachment: {
      type: 'warning',
      lines: [
        '\u26a0 Title search overdue \u2014 2 days past deadline',
        'Title company has not submitted the preliminary report. Escalating to @sarah.broker. Reminder sent to First American Title.',
      ],
    },
  },
  {
    sender: 'Sarah Brooks',
    avatar: { initials: 'SB', bg: '#4A7A62' },
    time: '9:16 AM',
    text: "Thanks, I'll follow up with First American directly. Can you flag me if the inspection report isn't in by Thursday?",
  },
  {
    sender: 'Transaction Agent',
    avatar: 'app',
    time: '9:16 AM',
    text: "Done. Inspection reminder set for `Thu Apr 10, 9:00 AM`. I'll escalate to you if it's not received by then.",
    attachment: {
      type: 'success',
      lines: [
        '\u2713 13 of 14 deadlines on track \u2014 Next due: inspection period closes Apr 14 (7 days). All parties notified.',
      ],
    },
  },
  {
    grouped: true,
    sender: 'Transaction Agent',
    time: '9:16 AM',
    text: '',
    reactions: ['\ud83d\udc4d 2', '\u2713 1'],
  },
];

const CHANNELS = [
  { name: 'deal-4892', active: true },
  { name: 'commissions', badge: '1' },
  { name: 'listings' },
  { name: 'compliance' },
];

const AGENTS = [
  { name: 'transaction-agent', online: true },
  { name: 'commission-agent', online: true },
  { name: 'listing-agent', online: false },
];

/* ───── Helpers ───── */
function renderBold(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={i} style={{ background: 'rgba(255,255,255,0.06)', padding: '1px 4px', borderRadius: '3px', fontSize: '12px' }}>{part.slice(1, -1)}</code>;
    }
    return part;
  });
}

const attachmentColors = {
  info: { border: '#2196F3', bg: 'rgba(33,150,243,0.06)' },
  warning: { border: '#FF9800', bg: 'rgba(255,152,0,0.06)' },
  success: { border: '#4CAF50', bg: 'rgba(76,175,80,0.06)' },
};

/* ───── Component ───── */
export default function SlackChat() {
  const [visibleMessages, setVisibleMessages] = useState<number>(0);
  const [streamedText, setStreamedText] = useState('');
  const [showAttachment, setShowAttachment] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [showTyping, setShowTyping] = useState(false);
  const [phase, setPhase] = useState<'idle' | 'typing' | 'streaming' | 'attachment' | 'reactions' | 'done'>('idle');
  const messagesRef = useRef<HTMLDivElement>(null);
  const cycleRef = useRef<number>(0);

  const scrollToBottom = useCallback(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, []);

  // Stream text character by character
  const streamText = useCallback((text: string): Promise<void> => {
    return new Promise((resolve) => {
      let i = 0;
      setStreamedText('');
      const interval = setInterval(() => {
        if (i < text.length) {
          setStreamedText(text.slice(0, i + 1));
          i++;
          scrollToBottom();
        } else {
          clearInterval(interval);
          resolve();
        }
      }, text[i] === ' ' ? 8 : 18);
    });
  }, [scrollToBottom]);

  // Main animation loop
  useEffect(() => {
    let cancelled = false;
    const currentCycle = cycleRef.current;

    async function animate() {
      // Reset state
      setVisibleMessages(0);
      setStreamedText('');
      setShowAttachment(false);
      setShowReactions(false);
      setShowTyping(false);
      setPhase('idle');

      await sleep(1200);

      for (let i = 0; i < ANIMATED_MESSAGES.length; i++) {
        if (cancelled) return;
        const msg = ANIMATED_MESSAGES[i];

        // Show typing indicator (except grouped messages)
        if (!msg.grouped) {
          setShowTyping(true);
          setPhase('typing');
          scrollToBottom();
          await sleep(1200);
          setShowTyping(false);
        }

        // Show message
        setVisibleMessages(i + 1);
        setPhase('streaming');

        // Stream text if it has text
        if (msg.text) {
          await streamText(msg.text);
          await sleep(300);
        }

        // Show attachment
        if (msg.attachment) {
          setShowAttachment(true);
          setPhase('attachment');
          scrollToBottom();
          await sleep(800);
        }

        // Show reactions
        if (msg.reactions) {
          setShowReactions(true);
          setPhase('reactions');
          scrollToBottom();
          await sleep(600);
        }

        // Reset per-message state for next message
        setStreamedText('');
        setShowAttachment(false);
        setShowReactions(false);
        await sleep(400);
      }

      // Final typing indicator
      setShowTyping(true);
      scrollToBottom();
      await sleep(2500);
      setShowTyping(false);

      // Pause before loop
      setPhase('done');
      await sleep(4000);

      if (!cancelled) {
        cycleRef.current++;
        animate();
      }
    }

    animate();
    return () => { cancelled = true; };
  }, [streamText, scrollToBottom]);

  return (
    <div className="slack-window">
      {/* Sidebar */}
      <div className="slack-sidebar">
        <div className="slack-workspace">
          <div className="slack-ws-icon">A</div>
          <span className="slack-ws-name">Acme RE</span>
        </div>

        <div className="slack-section-label">Channels</div>
        {CHANNELS.map((ch) => (
          <div key={ch.name} className={`slack-channel ${ch.active ? 'active' : ''}`}>
            <span className="slack-hash">#</span>
            <span>{ch.name}</span>
            {ch.badge && <span className="slack-badge">{ch.badge}</span>}
          </div>
        ))}

        <div className="slack-section-label" style={{ marginTop: 16 }}>Agents</div>
        {AGENTS.map((ag) => (
          <div key={ag.name} className="slack-agent">
            <span className={`slack-dot ${ag.online ? 'online' : ''}`} />
            <span>{ag.name}</span>
          </div>
        ))}
      </div>

      {/* Main */}
      <div className="slack-main">
        <div className="slack-header">
          <span className="slack-header-channel">#deal-4892</span>
          <span className="slack-header-meta">{'\u2014'} 742 Elm St {'\u2014'} Johnson/Rivera</span>
        </div>

        <div className="slack-messages" ref={messagesRef}>
          {/* Static history */}
          {STATIC_MESSAGES.map((msg, i) => (
            <div key={`s-${i}`} className="slack-msg history">
              <Avatar data={msg.avatar} />
              <div className="slack-msg-body">
                <div className="slack-msg-header">
                  <span className="slack-sender">{msg.sender}</span>
                  {msg.avatar === 'app' && <span className="slack-app-tag">APP</span>}
                  <span className="slack-time">{msg.time}</span>
                </div>
                <div className="slack-msg-text">{renderBold(msg.text)}</div>
              </div>
            </div>
          ))}

          {/* New divider */}
          <div className="slack-new-divider">
            <span>New</span>
          </div>

          {/* Animated messages */}
          {ANIMATED_MESSAGES.slice(0, visibleMessages).map((msg, i) => {
            const isLatest = i === visibleMessages - 1;
            const displayText = isLatest && streamedText ? streamedText : msg.text;
            const displayAttachment = isLatest ? showAttachment : true;
            const displayReactions = isLatest ? showReactions : !!msg.reactions;

            return (
              <div key={`a-${i}`} className={`slack-msg animated-in ${msg.grouped ? 'grouped' : ''}`}>
                {!msg.grouped && <Avatar data={msg.avatar} />}
                {msg.grouped && <div className="slack-avatar-spacer" />}
                <div className="slack-msg-body">
                  {!msg.grouped && (
                    <div className="slack-msg-header">
                      <span className="slack-sender">{msg.sender}</span>
                      {msg.avatar === 'app' && <span className="slack-app-tag">APP</span>}
                      <span className="slack-time">{msg.time}</span>
                    </div>
                  )}
                  {displayText && (
                    <div className="slack-msg-text">
                      {renderBold(displayText)}
                      {isLatest && phase === 'streaming' && <span className="slack-cursor" />}
                    </div>
                  )}
                  {msg.attachment && displayAttachment && (
                    <div className="slack-attachment" style={{
                      borderLeftColor: attachmentColors[msg.attachment.type].border,
                      background: attachmentColors[msg.attachment.type].bg,
                    }}>
                      {msg.attachment.lines.map((line, li) => (
                        <div key={li} className="slack-attachment-line">{renderBold(line)}</div>
                      ))}
                    </div>
                  )}
                  {msg.reactions && displayReactions && (
                    <div className="slack-reactions">
                      {msg.reactions.map((r, ri) => (
                        <span key={ri} className="slack-reaction">{r}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Typing indicator */}
          {showTyping && (
            <div className="slack-msg">
              <Avatar data="app" />
              <div className="slack-msg-body">
                <div className="slack-typing">
                  <span className="slack-typing-dot" />
                  <span className="slack-typing-dot" />
                  <span className="slack-typing-dot" />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="slack-input">
          <span>Message #deal-4892</span>
        </div>
      </div>
    </div>
  );
}

function Avatar({ data }: { data: string | { initials: string; bg: string } | undefined }) {
  if (data === 'app') {
    return (
      <div className="slack-avatar app-avatar">
        <svg viewBox="0 0 20 20" fill="none" width="20" height="20">
          <rect width="20" height="20" rx="4" fill="#1B2A4A" />
          <path d="M6 5h2v10H6zM12 5h2v10h-2z" fill="#B5862A" />
          <rect x="7" y="7" width="7" height="2" rx="0.5" fill="#fff" opacity="0.6" transform="rotate(-15 10.5 8)" />
        </svg>
      </div>
    );
  }
  if (data && typeof data === 'object') {
    return (
      <div className="slack-avatar" style={{ background: data.bg, color: '#fff', fontSize: '11px', fontWeight: 600 }}>
        {data.initials}
      </div>
    );
  }
  return <div className="slack-avatar" />;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
