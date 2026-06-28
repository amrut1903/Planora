export interface SuggestedTask {
  title: string;
  sourceSubject: string;
  sourceSender: string;
  suggestedDeadline: string | null;
  priority: 'high' | 'medium' | 'low';
  category: 'assignment' | 'meeting' | 'personal' | 'study' | 'other';
  emoji: string;
  gmailMessageId: string;
}

export async function scanGmailForDeadlines(token: string): Promise<SuggestedTask[]> {
  try {
    const query = encodeURIComponent("subject:(deadline OR due OR submit OR assignment OR reminder OR meeting OR interview OR bill OR payment)");
    const response = await fetch(`https://www.googleapis.com/gmail/v1/users/me/messages?maxResults=20&q=${query}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    const messages = data.messages;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return [];
    }

    const emails = [];
    const maxToProcess = Math.min(messages.length, 8);

    for (let i = 0; i < maxToProcess; i++) {
      const id = messages[i].id;
      const msgRes = await fetch(`https://www.googleapis.com/gmail/v1/users/me/messages/${id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (msgRes.ok) {
        const msgData = await msgRes.json();
        const headers = msgData.payload?.headers;
        if (headers && Array.isArray(headers)) {
          const subject = headers.find(h => h.name === 'Subject')?.value;
          const sender = headers.find(h => h.name === 'From')?.value;
          const date = headers.find(h => h.name === 'Date')?.value;
          
          if (subject) {
            emails.push({ subject, sender, date, gmailMessageId: id });
          }
        }
      }
    }

    if (emails.length === 0) {
      return [];
    }

    const geminiRes = await fetch('/api/gemini/scanEmails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emails })
    });

    if (geminiRes.ok) {
      const contentType = geminiRes.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const tasks: SuggestedTask[] = await geminiRes.json();
        // Match the generated tasks with original message IDs based on sourceSubject if needed,
        // since the prompt returns gmailMessageId: ""
        const enrichedTasks = tasks.map(task => {
          const matchedEmail = emails.find(e => e.subject === task.sourceSubject);
          return {
            ...task,
            gmailMessageId: matchedEmail?.gmailMessageId || ''
          };
        });
        return enrichedTasks;
      } else {
        console.warn("[gmailScanner] Server returned non-JSON response:", geminiRes.status, contentType);
      }
    }

    return [];
  } catch (err) {
    console.error("Error scanning Gmail:", err);
    return [];
  }
}
