import { theme } from '../theme'

interface DeleteConfirmationModalProps {
  deleteTarget: {
    id: string
    name: string
    isOwner: boolean
  }
  deleteConfirmCode: string
  deleteConfirmInput: string
  setDeleteConfirmInput: (value: string) => void
  onClose: () => void
  onConfirm: () => void
}

export const DeleteConfirmationModal = ({
  deleteTarget,
  deleteConfirmCode,
  deleteConfirmInput,
  setDeleteConfirmInput,
  onClose,
  onConfirm,
}: DeleteConfirmationModalProps) => {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 px-4">
      <div className={`w-full max-w-md rounded-[2rem] ${theme.colors.ui.surface} p-8 shadow-2xl`}>
        <h2 className={`text-xl font-black ${theme.colors.ui.text}`}>
          {deleteTarget.isOwner ? 'Delete Project' : 'Leave Project'}
        </h2>

        <p className={`mt-2 text-sm font-bold ${theme.colors.ui.textMuted}`}>
          {deleteTarget.isOwner
            ? `This will permanently delete “${deleteTarget.name}”.`
            : `You will leave “${deleteTarget.name}”.`}
        </p>

        <div className={`mt-4 rounded-xl ${theme.colors.ui.background} border ${theme.colors.ui.borderStrong} p-4`}>
          <p className={`text-[10px] font-black uppercase tracking-widest ${theme.colors.ui.textLight}`}>
            Confirmation Code
          </p>
          <p className={`mt-1 font-mono text-2xl font-black ${theme.colors.ui.text}`}>{deleteConfirmCode}</p>
        </div>

        <input
          value={deleteConfirmInput}
          onChange={(e) => setDeleteConfirmInput(e.target.value)}
          placeholder="Type the code exactly"
          className={`mt-4 w-full rounded-xl border-2 px-4 py-3 font-mono text-sm font-black ${theme.colors.ui.input}`}
          autoFocus
        />

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className={`rounded-xl border-2 ${theme.colors.ui.borderStrong} px-5 py-2.5 text-sm font-black ${theme.colors.ui.textMuted} hover:${theme.colors.ui.background}`}
          >
            Cancel
          </button>

          <button
            disabled={deleteConfirmInput.trim().toUpperCase() !== deleteConfirmCode}
            onClick={onConfirm}
            className={`rounded-xl px-5 py-2.5 text-sm font-black text-white ${
              deleteConfirmInput.trim().toUpperCase() === deleteConfirmCode
                ? 'bg-rose-600 hover:bg-rose-700'
                : 'bg-rose-300 dark:bg-rose-900/40 dark:text-rose-700/60 cursor-not-allowed'
            }`}
          >
            {deleteTarget.isOwner ? 'Delete Project' : 'Leave Project'}
          </button>
        </div>
      </div>
    </div>
  )
}

