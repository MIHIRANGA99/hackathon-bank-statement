import Chatbot from './components/Chatbot/Chatbot';

function App() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-2">
      <h1 className="text-4xl font-bold tracking-tight">
        Account Statement Analyser
      </h1>
      <p className="text-muted-foreground">Frontend is up and running.</p>
      
      {/* Financial Chatbot Component */}
      <Chatbot />
    </div>
  )
}

export default App

