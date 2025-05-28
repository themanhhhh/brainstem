# Hướng dẫn Đa ngôn ngữ (Multilanguage Guide)

## Tổng quan
Dự án này hỗ trợ đa ngôn ngữ với 2 ngôn ngữ chính: Tiếng Anh (EN) và Tiếng Việt (VI).

## Cấu trúc

### 1. Language Context (`src/app/context/LanguageContext.js`)
- Quản lý state ngôn ngữ hiện tại
- Lưu trữ lựa chọn ngôn ngữ vào localStorage
- Cung cấp các method để thay đổi ngôn ngữ

### 2. Translations (`src/app/translations/index.js`)
- Chứa tất cả các text translations
- Tổ chức theo cấu trúc nested object
- Helper function `t()` để lấy translation

### 3. useTranslation Hook (`src/app/hooks/useTranslation.js`)
- Custom hook để sử dụng translations
- Tự động lấy ngôn ngữ hiện tại từ context

### 4. Language Selector Component (`src/app/components/LanguageSelector/LanguageSelector.jsx`)
- UI component để chuyển đổi ngôn ngữ
- Hiển thị dropdown với flags

## Cách sử dụng

### Bước 1: Import useTranslation hook
```javascript
import { useTranslation } from '../hooks/useTranslation';
```

### Bước 2: Sử dụng trong component
```javascript
const MyComponent = () => {
  const t = useTranslation();
  
  return (
    <div>
      <h1>{t('common.welcome')}</h1>
      <p>{t('common.description')}</p>
    </div>
  );
};
```

### Bước 3: Thêm translations mới
Mở file `src/app/translations/index.js` và thêm text mới:

```javascript
export const translations = {
  EN: {
    mySection: {
      title: "My Title",
      description: "My Description"
    }
  },
  VI: {
    mySection: {
      title: "Tiêu đề của tôi",
      description: "Mô tả của tôi"
    }
  }
};
```

## Ví dụ thực tế

### 1. Reserve Component
```javascript
import { useTranslation } from "../../hooks/useTranslation";

const Reserve = () => {
  const t = useTranslation();
  
  return (
    <div>
      <h1>{t('reserve.title')}</h1>
      <p>{t('reserve.subtitle')}</p>
    </div>
  );
};
```

### 2. Form với validation
```javascript
const Form = () => {
  const t = useTranslation();
  const [errors, setErrors] = useState({});
  
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) {
      newErrors.name = t('common.required');
    }
    setErrors(newErrors);
  };
  
  return (
    <form>
      <input placeholder={t('form.namePlaceholder')} />
      {errors.name && <span>{errors.name}</span>}
    </form>
  );
};
```

### 3. Dynamic content
```javascript
const OrderStatus = ({ status }) => {
  const t = useTranslation();
  
  return (
    <span>{t(`order.status.${status}`)}</span>
  );
};
```

## Best Practices

### 1. Tổ chức translations theo module
```javascript
translations: {
  nav: { /* navigation items */ },
  home: { /* home page */ },
  profile: { /* profile page */ },
  common: { /* shared texts */ }
}
```

### 2. Sử dụng nested keys cho tổ chức tốt hơn
```javascript
t('payment.form.fields.email')
// thay vì
t('paymentFormFieldsEmail')
```

### 3. Xử lý pluralization
```javascript
// Trong translations
messages: {
  zero: "No messages",
  one: "1 message",
  many: "{{count}} messages"
}

// Sử dụng
const count = 5;
t(`messages.${count === 0 ? 'zero' : count === 1 ? 'one' : 'many'}`, { count })
```

### 4. Fallback cho missing translations
```javascript
const safeTranslate = (key) => {
  const translation = t(key);
  return translation === key ? 'Translation missing' : translation;
};
```

## Checklist khi thêm tính năng mới

- [ ] Thêm translations cho cả EN và VI
- [ ] Import useTranslation hook
- [ ] Replace hardcoded text với t() function
- [ ] Test với cả 2 ngôn ngữ
- [ ] Kiểm tra responsive với text dài (Tiếng Việt thường dài hơn)

## Components đã hỗ trợ đa ngôn ngữ

- [x] Reserve Component
- [x] Reserve Form
- [x] Payment Page (partial)
- [ ] Navigation
- [ ] Footer
- [ ] Profile
- [ ] Address Manager
- [ ] Cart
- [ ] Menu
- [ ] Home Page

## Troubleshooting

### Lỗi "useTranslation must be used within a LanguageProvider"
Đảm bảo component được wrap trong LanguageProvider:
```javascript
// app/layout.js
<LanguageProvider>
  {children}
</LanguageProvider>
```

### Translation không update khi đổi ngôn ngữ
Kiểm tra xem có đang cache translation không:
```javascript
// Sai
const title = t('home.title'); // Chỉ chạy 1 lần

// Đúng
return <h1>{t('home.title')}</h1>; // Chạy mỗi khi render
```

### Text bị cắt hoặc overflow
Thêm CSS để xử lý text dài:
```css
.text {
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
}
``` 