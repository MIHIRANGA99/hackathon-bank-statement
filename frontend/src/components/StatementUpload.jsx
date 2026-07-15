import { useCallback, useRef, useState } from 'react'
import { UploadCloud, FileWarning } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { processStatementFile, StatementError } from '@/lib/statements'

const SAMPLE_FILE_URL = '/sample-data/sample-statement-1.csv'
const SAMPLE_FILE_NAME = 'sample-statement-1.csv'

export function StatementUpload({ onParsed }) {
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState(null)
  const inputRef = useRef(null)

  const handleFile = useCallback(
    async (file) => {
      if (!file) return
      setError(null)
      setIsProcessing(true)
      try {
        const transactions = await processStatementFile(file)
        onParsed?.(transactions, file.name)
      } catch (err) {
        if (err instanceof StatementError) {
          setError(err.message)
        } else {
          setError('Unable to process this statement. Please check the file and try again.')
        }
      } finally {
        setIsProcessing(false)
      }
    },
    [onParsed]
  )

  const handleTrySample = useCallback(async () => {
    setError(null)
    setIsProcessing(true)
    try {
      const res = await fetch(SAMPLE_FILE_URL)
      const blob = await res.blob()
      const file = new File([blob], SAMPLE_FILE_NAME, { type: 'text/csv' })
      const transactions = await processStatementFile(file)
      onParsed?.(transactions, SAMPLE_FILE_NAME)
    } catch {
      setError('Unable to process this statement. Please check the file and try again.')
    } finally {
      setIsProcessing(false)
    }
  }, [onParsed])

  const onDrop = useCallback(
    (e) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files?.[0]
      handleFile(file)
    },
    [handleFile]
  )

  const onBrowseChange = useCallback(
    (e) => {
      const file = e.target.files?.[0]
      handleFile(file)
      e.target.value = ''
    },
    [handleFile]
  )

  return (
    <div className="flex w-full max-w-lg flex-col gap-4">
      <Card
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={`border-2 border-dashed transition-colors ${
          isDragging ? 'border-primary bg-accent' : 'border-muted-foreground/25'
        }`}
      >
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <UploadCloud className="size-10 text-muted-foreground" />
          <div>
            <p className="font-medium">Drag & drop your bank statement here</p>
            <p className="text-sm text-muted-foreground">PDF or CSV, up to 2MB</p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,.pdf"
            className="hidden"
            onChange={onBrowseChange}
          />
          <Button
            type="button"
            variant="outline"
            disabled={isProcessing}
            onClick={() => inputRef.current?.click()}
          >
            Browse files
          </Button>
        </CardContent>
      </Card>

      <div className="flex items-center justify-center">
        <Button
          type="button"
          variant="link"
          disabled={isProcessing}
          onClick={handleTrySample}
        >
          Try a sample statement instead
        </Button>
      </div>

      {isProcessing && (
        <p className="text-center text-sm text-muted-foreground">Processing statement…</p>
      )}

      {error && (
        <Alert variant="destructive">
          <FileWarning className="size-4" />
          <AlertTitle>Couldn't process file</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
