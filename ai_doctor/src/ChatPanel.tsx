// src/ChatPanel.tsx
import React from 'react';

interface Message {
  sender: 'ai' | 'user';
  text: string;
}

interface ChatPanelProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ messages, onSendMessage, isLoading }) => {
  const [input, setInput] = React.useState('');

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
    }
  };
  const bottomRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);
  return (

    <div className="fixed bottom-5 right-5 w-96 h-[500px] bg-white rounded-lg shadow-2xl flex flex-col">
      <div className="bg-indigo-600 text-white p-3 rounded-t-lg">
        <h3 className="font-bold text-center">AI Follow-up Questions</h3>
      </div>
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map((msg, index) => (
          <div key={index} className={`my-2 p-3 rounded-lg max-w-[80%] ${
            msg.sender === 'ai' ? 'bg-gray-200 text-gray-800 self-start' : 'bg-blue-500 text-white self-end ml-auto'
          }`}>
            {msg.text}
          </div>
        ))}
         {isLoading && <div className="text-center text-gray-500">AI is thinking...</div>}
      </div>
      <div className="p-4 border-t flex">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type your answer..."
          className="flex-1 p-2 border rounded-l-md focus:ring-indigo-500"
          disabled={isLoading}
        />
        <button onClick={handleSend} className="bg-indigo-600 text-white px-4 rounded-r-md hover:bg-indigo-700" disabled={isLoading}>
          Send
        </button>
      </div>
    </div>
  );
};