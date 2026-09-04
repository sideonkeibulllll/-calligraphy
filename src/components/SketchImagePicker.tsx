/**
 * 中文名：画摹选图器
 * 职责：隐藏的 input[file]，调起系统图片选择器，选中后回调 File
 * 依赖：无
 */
import { forwardRef, useImperativeHandle, useRef } from 'react'

export interface SketchImagePickerHandle {
  open: () => void
}

interface SketchImagePickerProps {
  onPicked: (file: File) => void
}

const SketchImagePicker = forwardRef<SketchImagePickerHandle, SketchImagePickerProps>(
  function SketchImagePicker({ onPicked }, ref) {
    const inputRef = useRef<HTMLInputElement>(null)

    useImperativeHandle(ref, () => ({
      open: () => inputRef.current?.click()
    }))

    return (
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onPicked(file)
          e.target.value = ''
        }}
      />
    )
  }
)

export default SketchImagePicker
