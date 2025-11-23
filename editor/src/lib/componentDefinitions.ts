import { ComponentDefinition } from '../types';

export const componentDefinitions: ComponentDefinition[] = [
  // Layout Components
  {
    type: 'Container',
    label: 'Container',
    icon: 'LayoutGrid',
    category: 'layout',
    defaultProps: {
      className: 'flex flex-col gap-4 p-4',
    },
    propSchema: {
      className: {
        type: 'string',
        label: 'CSS Classes',
        defaultValue: 'flex flex-col gap-4 p-4',
      },
    },
  },
  {
    type: 'Box',
    label: 'Box',
    icon: 'Square',
    category: 'layout',
    defaultProps: {
      className: 'p-4 border border-gray-200 rounded',
    },
    propSchema: {
      className: {
        type: 'string',
        label: 'CSS Classes',
        defaultValue: 'p-4 border border-gray-200 rounded',
      },
    },
  },
  {
    type: 'Grid',
    label: 'Grid',
    icon: 'Grid3x3',
    category: 'layout',
    defaultProps: {
      className: 'grid grid-cols-3 gap-4',
      columns: 3,
    },
    propSchema: {
      columns: {
        type: 'number',
        label: 'Columns',
        defaultValue: 3,
        validation: { min: 1, max: 12 },
      },
    },
  },
  {
    type: 'Flex',
    label: 'Flex Container',
    icon: 'Columns',
    category: 'layout',
    defaultProps: {
      className: 'flex gap-4',
      direction: 'row',
    },
    propSchema: {
      direction: {
        type: 'select',
        label: 'Direction',
        defaultValue: 'row',
        options: [
          { label: 'Row', value: 'row' },
          { label: 'Column', value: 'column' },
        ],
      },
    },
  },
  {
    type: 'Section',
    label: 'Section',
    icon: 'RectangleHorizontal',
    category: 'layout',
    defaultProps: {
      className: 'py-16 px-4',
    },
    propSchema: {},
  },

  // Typography Components
  {
    type: 'Text',
    label: 'Text',
    icon: 'Type',
    category: 'typography',
    defaultProps: {
      content: 'Text',
      className: 'text-base',
    },
    propSchema: {
      content: {
        type: 'string',
        label: 'Content',
        defaultValue: 'Text',
      },
    },
  },
  {
    type: 'Heading',
    label: 'Heading',
    icon: 'Heading1',
    category: 'typography',
    defaultProps: {
      content: 'Heading',
      level: 1,
      className: 'text-2xl font-bold',
    },
    propSchema: {
      content: {
        type: 'string',
        label: 'Content',
        defaultValue: 'Heading',
      },
      level: {
        type: 'select',
        label: 'Level',
        defaultValue: 1,
        options: [
          { label: 'H1', value: 1 },
          { label: 'H2', value: 2 },
          { label: 'H3', value: 3 },
          { label: 'H4', value: 4 },
          { label: 'H5', value: 5 },
          { label: 'H6', value: 6 },
        ],
      },
    },
  },
  {
    type: 'Paragraph',
    label: 'Paragraph',
    icon: 'AlignLeft',
    category: 'typography',
    defaultProps: {
      content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      className: 'text-base leading-relaxed',
    },
    propSchema: {
      content: {
        type: 'string',
        label: 'Content',
        defaultValue: 'Lorem ipsum dolor sit amet...',
      },
    },
  },
  {
    type: 'Link',
    label: 'Link',
    icon: 'Link',
    category: 'typography',
    defaultProps: {
      content: 'Link',
      href: '#',
      className: 'text-blue-500 hover:underline',
    },
    propSchema: {
      content: {
        type: 'string',
        label: 'Text',
        defaultValue: 'Link',
      },
      href: {
        type: 'string',
        label: 'URL',
        defaultValue: '#',
      },
    },
  },

  // Form Components
  {
    type: 'Input',
    label: 'Input',
    icon: 'FormInput',
    category: 'form',
    defaultProps: {
      type: 'text',
      placeholder: 'Enter text...',
      className: 'px-3 py-2 border border-gray-300 rounded',
    },
    propSchema: {
      type: {
        type: 'select',
        label: 'Type',
        defaultValue: 'text',
        options: [
          { label: 'Text', value: 'text' },
          { label: 'Email', value: 'email' },
          { label: 'Password', value: 'password' },
          { label: 'Number', value: 'number' },
          { label: 'Tel', value: 'tel' },
          { label: 'URL', value: 'url' },
        ],
      },
      placeholder: {
        type: 'string',
        label: 'Placeholder',
        defaultValue: 'Enter text...',
      },
    },
  },
  {
    type: 'Button',
    label: 'Button',
    icon: 'MousePointer',
    category: 'form',
    defaultProps: {
      content: 'Button',
      variant: 'primary',
      className: 'px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600',
    },
    propSchema: {
      content: {
        type: 'string',
        label: 'Text',
        defaultValue: 'Button',
      },
      variant: {
        type: 'select',
        label: 'Variant',
        defaultValue: 'primary',
        options: [
          { label: 'Primary', value: 'primary' },
          { label: 'Secondary', value: 'secondary' },
          { label: 'Outline', value: 'outline' },
        ],
      },
    },
  },
  {
    type: 'Textarea',
    label: 'Textarea',
    icon: 'AlignJustify',
    category: 'form',
    defaultProps: {
      placeholder: 'Enter text...',
      rows: 4,
      className: 'px-3 py-2 border border-gray-300 rounded w-full',
    },
    propSchema: {
      placeholder: {
        type: 'string',
        label: 'Placeholder',
        defaultValue: 'Enter text...',
      },
      rows: {
        type: 'number',
        label: 'Rows',
        defaultValue: 4,
      },
    },
  },
  {
    type: 'Select',
    label: 'Select',
    icon: 'ChevronDown',
    category: 'form',
    defaultProps: {
      options: ['Option 1', 'Option 2', 'Option 3'],
      className: 'px-3 py-2 border border-gray-300 rounded',
    },
    propSchema: {
      options: {
        type: 'json',
        label: 'Options',
        defaultValue: ['Option 1', 'Option 2', 'Option 3'],
      },
    },
  },
  {
    type: 'Checkbox',
    label: 'Checkbox',
    icon: 'CheckSquare',
    category: 'form',
    defaultProps: {
      label: 'Checkbox label',
      checked: false,
    },
    propSchema: {
      label: {
        type: 'string',
        label: 'Label',
        defaultValue: 'Checkbox label',
      },
    },
  },
  {
    type: 'Radio',
    label: 'Radio',
    icon: 'Circle',
    category: 'form',
    defaultProps: {
      label: 'Radio label',
      name: 'radio-group',
    },
    propSchema: {
      label: {
        type: 'string',
        label: 'Label',
        defaultValue: 'Radio label',
      },
    },
  },
  {
    type: 'Form',
    label: 'Form',
    icon: 'FileText',
    category: 'form',
    defaultProps: {
      className: 'space-y-4',
    },
    propSchema: {},
  },

  // Data Display
  {
    type: 'List',
    label: 'List',
    icon: 'List',
    category: 'data',
    defaultProps: {
      items: ['Item 1', 'Item 2', 'Item 3'],
      className: 'list-disc list-inside',
    },
    propSchema: {
      items: {
        type: 'json',
        label: 'Items',
        defaultValue: ['Item 1', 'Item 2', 'Item 3'],
      },
    },
  },
  {
    type: 'Table',
    label: 'Table',
    icon: 'Table',
    category: 'data',
    defaultProps: {
      columns: ['Column 1', 'Column 2'],
      rows: [
        ['Data 1', 'Data 2'],
        ['Data 3', 'Data 4'],
      ],
      className: 'w-full border-collapse',
    },
    propSchema: {
      columns: {
        type: 'json',
        label: 'Columns',
        defaultValue: ['Column 1', 'Column 2'],
      },
      rows: {
        type: 'json',
        label: 'Rows',
        defaultValue: [
          ['Data 1', 'Data 2'],
          ['Data 3', 'Data 4'],
        ],
      },
    },
  },
  {
    type: 'Card',
    label: 'Card',
    icon: 'CreditCard',
    category: 'data',
    defaultProps: {
      title: 'Card Title',
      description: 'Card description',
      className: 'border border-gray-200 rounded-lg p-6',
    },
    propSchema: {
      title: {
        type: 'string',
        label: 'Title',
        defaultValue: 'Card Title',
      },
      description: {
        type: 'string',
        label: 'Description',
        defaultValue: 'Card description',
      },
    },
  },
  {
    type: 'Badge',
    label: 'Badge',
    icon: 'Tag',
    category: 'data',
    defaultProps: {
      text: 'Badge',
      variant: 'default',
      className: 'inline-block px-2 py-1 text-xs rounded',
    },
    propSchema: {
      text: {
        type: 'string',
        label: 'Text',
        defaultValue: 'Badge',
      },
      variant: {
        type: 'select',
        label: 'Variant',
        defaultValue: 'default',
        options: [
          { label: 'Default', value: 'default' },
          { label: 'Success', value: 'success' },
          { label: 'Warning', value: 'warning' },
          { label: 'Error', value: 'error' },
        ],
      },
    },
  },

  // Media Components
  {
    type: 'Image',
    label: 'Image',
    icon: 'Image',
    category: 'media',
    defaultProps: {
      src: 'https://via.placeholder.com/300x200',
      alt: 'Placeholder',
      className: 'w-full h-auto',
    },
    propSchema: {
      src: {
        type: 'string',
        label: 'Source URL',
        defaultValue: 'https://via.placeholder.com/300x200',
      },
      alt: {
        type: 'string',
        label: 'Alt Text',
        defaultValue: 'Placeholder',
      },
    },
  },
  {
    type: 'Video',
    label: 'Video',
    icon: 'Video',
    category: 'media',
    defaultProps: {
      src: '',
      controls: true,
      className: 'w-full',
    },
    propSchema: {
      src: {
        type: 'string',
        label: 'Video URL',
        defaultValue: '',
      },
    },
  },
  {
    type: 'Icon',
    label: 'Icon',
    icon: 'Star',
    category: 'media',
    defaultProps: {
      name: 'star',
      size: 24,
      className: 'text-gray-700',
    },
    propSchema: {
      name: {
        type: 'string',
        label: 'Icon Name',
        defaultValue: 'star',
      },
      size: {
        type: 'number',
        label: 'Size',
        defaultValue: 24,
      },
    },
  },

  // Navigation
  {
    type: 'Navbar',
    label: 'Navbar',
    icon: 'Menu',
    category: 'navigation',
    defaultProps: {
      brand: 'Brand',
      className: 'bg-white border-b border-gray-200 px-4 py-3',
    },
    propSchema: {
      brand: {
        type: 'string',
        label: 'Brand Name',
        defaultValue: 'Brand',
      },
    },
  },
  {
    type: 'Breadcrumb',
    label: 'Breadcrumb',
    icon: 'ChevronRight',
    category: 'navigation',
    defaultProps: {
      items: ['Home', 'Products', 'Details'],
      className: 'flex gap-2 text-sm',
    },
    propSchema: {
      items: {
        type: 'json',
        label: 'Items',
        defaultValue: ['Home', 'Products', 'Details'],
      },
    },
  },
  {
    type: 'Tabs',
    label: 'Tabs',
    icon: 'Tabs',
    category: 'navigation',
    defaultProps: {
      tabs: ['Tab 1', 'Tab 2', 'Tab 3'],
      className: 'border-b border-gray-200',
    },
    propSchema: {
      tabs: {
        type: 'json',
        label: 'Tabs',
        defaultValue: ['Tab 1', 'Tab 2', 'Tab 3'],
      },
    },
  },
  {
    type: 'Pagination',
    label: 'Pagination',
    icon: 'MoreHorizontal',
    category: 'navigation',
    defaultProps: {
      totalPages: 10,
      currentPage: 1,
      className: 'flex gap-2',
    },
    propSchema: {
      totalPages: {
        type: 'number',
        label: 'Total Pages',
        defaultValue: 10,
      },
    },
  },

  // Feedback
  {
    type: 'Alert',
    label: 'Alert',
    icon: 'AlertCircle',
    category: 'feedback',
    defaultProps: {
      type: 'info',
      message: 'This is an alert message',
      className: 'p-4 rounded border',
    },
    propSchema: {
      type: {
        type: 'select',
        label: 'Type',
        defaultValue: 'info',
        options: [
          { label: 'Info', value: 'info' },
          { label: 'Success', value: 'success' },
          { label: 'Warning', value: 'warning' },
          { label: 'Error', value: 'error' },
        ],
      },
      message: {
        type: 'string',
        label: 'Message',
        defaultValue: 'This is an alert message',
      },
    },
  },
  {
    type: 'Modal',
    label: 'Modal',
    icon: 'Square',
    category: 'feedback',
    defaultProps: {
      title: 'Modal Title',
      isOpen: false,
      className: 'fixed inset-0 bg-black bg-opacity-50',
    },
    propSchema: {
      title: {
        type: 'string',
        label: 'Title',
        defaultValue: 'Modal Title',
      },
    },
  },
  {
    type: 'Toast',
    label: 'Toast',
    icon: 'MessageSquare',
    category: 'feedback',
    defaultProps: {
      message: 'Toast notification',
      duration: 3000,
    },
    propSchema: {
      message: {
        type: 'string',
        label: 'Message',
        defaultValue: 'Toast notification',
      },
    },
  },
  {
    type: 'Spinner',
    label: 'Spinner',
    icon: 'Loader',
    category: 'feedback',
    defaultProps: {
      size: 'medium',
      className: 'animate-spin',
    },
    propSchema: {
      size: {
        type: 'select',
        label: 'Size',
        defaultValue: 'medium',
        options: [
          { label: 'Small', value: 'small' },
          { label: 'Medium', value: 'medium' },
          { label: 'Large', value: 'large' },
        ],
      },
    },
  },
];
