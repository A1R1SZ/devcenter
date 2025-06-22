import React, { useState, useRef } from 'react';
import { Box, TextField, Button, Tooltip, Stack } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Modal, IconButton } from '@mui/material';
import PreviewIcon from '@mui/icons-material/Preview';

const MarkdownEditor = ({ value, onChange }) => {
  const textareaRef = useRef(null);

  const [openPreview, setOpenPreview] = useState(false);

  const insertAroundSelection = (before, after = before, block = false) => {
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.slice(start, end);
    const newline = block ? '\n' : '';

    const newText =
      value.slice(0, start) +
      newline +
      before +
      selected +
      after +
      newline +
      value.slice(end);

    onChange(newText);

    setTimeout(() => {
      textarea.focus();
      const pos = start + before.length + (block ? 1 : 0);
      textarea.setSelectionRange(pos, pos + selected.length);
    }, 0);
  };

  const handleKeyDown = (e) => {
    const isMac = navigator.userAgent.includes('Mac');
    const ctrlKey = isMac ? e.metaKey : e.ctrlKey;

    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      const tabCharacter = '    ';
      const newValue = value.substring(0, start) + tabCharacter + value.substring(end);
      onChange(newValue);

      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + tabCharacter.length;
      }, 0);
    }

    if (ctrlKey && (e.key === 'b' || e.key === 'B')) {
      e.preventDefault();
      insertAroundSelection('**');
    }

    if (ctrlKey && (e.key === 'i' || e.key === 'I')) {
      e.preventDefault();
      insertAroundSelection('*');
    }

    if (ctrlKey && e.key === '`') {
      e.preventDefault();
      insertAroundSelection('`');
    }

    if (ctrlKey && e.shiftKey && e.key.toLowerCase() === 'c') {
      e.preventDefault();
      insertAroundSelection('```js\n', '\n```', true);
    }
  };




  return (
    <Box>
      {/* TextArea */}
      <TextField
        inputRef={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        multiline
        minRows={12}
        fullWidth
        variant="outlined"
        label="Content"
        placeholder="Write your content here..."
        sx={{
        mb: 3,
        backgroundColor: "#393636",
        borderRadius: "5px",
        fontFamily: "monospace", // <--- ADD THIS
        "& .MuiInputBase-input": {
            color: "white",
            fontFamily: "monospace", // <--- Also here
            whiteSpace: "pre", // <--- Keeps tab/space formatting
        },
        "& .MuiInputLabel-root": { color: "whitesmoke" },
        "& .MuiInputLabel-root.Mui-focused": { color: "white" },
        }}

      />

      {/* Toolbar */}
      <Stack direction="row" spacing={1} mt={1}>
        <Tooltip title="Bold (**text**)">
          <Button onClick={() => insertAroundSelection('**')} variant="outlined">
            <b>B</b>
          </Button>
        </Tooltip>
        <Tooltip title="Italic (*text*)">
          <Button onClick={() => insertAroundSelection('*')} variant="outlined">
            <i>I</i>
          </Button>
        </Tooltip>
        <Tooltip title="Strikethrough (~~text~~)">
          <Button onClick={() => insertAroundSelection('~~')} variant="outlined">
            <s>S</s>
          </Button>
        </Tooltip>
        <Tooltip title="Inline Code (`code`)">
          <Button onClick={() => insertAroundSelection('`')} variant="outlined">
            {'<>'}
          </Button>
        </Tooltip>
        <Tooltip title="Code Block (```js\ncode\n```)">
        <Button
            onClick={() => insertAroundSelection('```js\n', '\n```', true)}
            variant="outlined"
        >
            {'{ }'}
        </Button>
        </Tooltip>
        <Tooltip title="Open Preview">
          <IconButton onClick={() => setOpenPreview(true)} color="primary">
            <PreviewIcon />
          </IconButton>
        </Tooltip>
      </Stack>

      {/* Markdown Preview */}
<Modal
  open={openPreview}
  onClose={() => setOpenPreview(false)}
  sx={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  }}
>
  <Box
    sx={{
      width: '60vw',
      maxHeight: '80vh',
      overflowY: 'auto',
      backgroundColor: '#2e2e2e',
      color: 'white',
      p: 3,
      borderRadius: 2,
      position: 'relative', // needed to position the close button
    }}
  >
    {/* Close Button */}
    <Button
      variant="contained"
      size="small"
      onClick={() => setOpenPreview(false)}
      sx={{
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: '#555',
        '&:hover': { backgroundColor: '#777' },
      }}
    >
      Close
    </Button>

    <ReactMarkdown
      components={{
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          return !inline && match ? (
            <SyntaxHighlighter
              style={oneDark}
              language={match[1]}
              PreTag="div"
              {...props}
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          ) : (
            <code
              style={{
                background: '#444',
                borderRadius: '4px',
                padding: '2px 4px',
                fontFamily: 'monospace',
              }}
              {...props}
            >
              {children}
            </code>
          );
        },
      }}
    >
      {value}
    </ReactMarkdown>
  </Box>
</Modal>

    </Box>
  );
};

export default MarkdownEditor;
