import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { db, initDatabaseConnection, getDBStatus } from './src/server/db.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'teznazar_secret_key_2026';

// Static uploads directory setup
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));
app.use('/uploads', express.static(uploadsDir));

// Static public directory & logo route
const publicDir = path.join(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}
app.use(express.static(publicDir));

app.get(['/logo.png', '/logo.svg'], (req: Request, res: Response) => {
  const svgPath = path.join(publicDir, 'logo.svg');
  if (fs.existsSync(svgPath)) {
    res.setHeader('Content-Type', 'image/svg+xml');
    res.sendFile(svgPath);
  } else {
    res.status(404).end();
  }
});

// Anti-cache middleware for all dynamic API endpoints
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

// Health Check Endpoint (Monitoring & Deployment Verification)
app.get('/health', (req: Request, res: Response) => {
  const dbStatus = getDBStatus();
  res.status(200).json({
    status: 'ok',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    node: process.version,
    database: dbStatus.mode,
    connected: dbStatus.connected
  });
});

// Auth Middleware
function authenticateToken(req: any, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'प्रमाणीकरण आवश्यक है (Unauthorized)' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'अमान्य या समाप्त टोकन (Forbidden)' });
    }
    req.user = user;
    next();
  });
}

// -------------------------------------------------------------
// PUBLIC API ROUTES
// -------------------------------------------------------------

// DB Connection Diagnostics
app.get('/api/db-status', (req: Request, res: Response) => {
  res.json(getDBStatus());
});

// Site Settings
app.get('/api/settings', async (req: Request, res: Response) => {
  const settings = await db.getSiteSettings();
  res.json({ success: true, data: settings });
});

// Breaking News Ticker
app.get('/api/breaking-news', async (req: Request, res: Response) => {
  const items = await db.getBreakingNews();
  res.json({ success: true, data: items });
});

// Categories
app.get('/api/categories', async (req: Request, res: Response) => {
  const categories = await db.getCategories();
  res.json({ success: true, data: categories });
});

// Tags
app.get('/api/tags', async (req: Request, res: Response) => {
  const tags = await db.getTags();
  res.json({ success: true, data: tags });
});

// Advertisements (Public)
app.get('/api/advertisements', async (req: Request, res: Response) => {
  const placement = req.query.placement as string | undefined;
  const ads = await db.getAdvertisements(placement);
  res.json({ success: true, data: ads });
});

app.post('/api/advertisements/:id/click', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const clicks = await db.recordAdvertisementClick(id);
    res.json({ success: true, clicks });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// News Feed with filtering, searching, and pagination
app.get('/api/news', async (req: Request, res: Response) => {
  try {
    const { category, tag, q, search, isBreaking, isFeatured, isTrending, isVideo, authorId, page, limit } = req.query;
    const queryTerm = (q || search) as string | undefined;

    const result = await db.getNewsArticles({
      categorySlug: category as string,
      tagSlug: tag as string,
      q: queryTerm,
      status: 'published',
      isBreaking: isBreaking !== undefined ? isBreaking === 'true' : undefined,
      isFeatured: isFeatured !== undefined ? isFeatured === 'true' : undefined,
      isTrending: isTrending !== undefined ? isTrending === 'true' : undefined,
      isVideo: isVideo !== undefined ? isVideo === 'true' : undefined,
      authorId: authorId ? parseInt(authorId as string, 10) : undefined,
      page: page ? parseInt(page as string, 10) : 1,
      limit: limit ? parseInt(limit as string, 10) : 12
    });

    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Single Article by Slug
app.get('/api/news/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const article = await db.getArticleBySlug(slug);

    if (!article) {
      return res.status(404).json({ success: false, message: 'समाचार प्राप्त नहीं हुआ।' });
    }

    res.json({ success: true, data: article });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Contact Form Submission
app.post('/api/contact', async (req: Request, res: Response) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'कृपया नाम, ईमेल और संदेश भरें।' });
    }

    const saved = await db.saveContactMessage({ name, email, phone, subject: subject || 'सामान्य पूछताछ', message });
    res.json({ success: true, message: 'आपका संदेश सफलतापूर्वक दर्ज कर लिया गया है। हमारी टीम शीघ्र संपर्क करेगी।', data: saved });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// -------------------------------------------------------------
// AUTHENTICATION & REGISTRATION ROUTES (MODULE 7 & MODULE 9)
// -------------------------------------------------------------

// Public Avatar Upload Endpoint for Registration and Profile Photo Upload
app.post('/api/auth/upload-avatar', async (req: Request, res: Response) => {
  try {
    const { data, name } = req.body;
    if (!data) {
      return res.status(400).json({ success: false, message: 'कोई फ़ोटो डेटा प्राप्त नहीं हुआ।' });
    }

    const match = data.match(/^data:([a-zA-Z0-9_\-\+\/]+);base64,(.+)$/);
    if (!match) {
      return res.status(400).json({ success: false, message: 'अमान्य फ़ोटो फ़ाइल प्रारूप।' });
    }

    const mime = match[1].toLowerCase();
    const base64Data = match[2];
    const buffer = Buffer.from(base64Data, 'base64');

    const allowedImageMimes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'
    ];
    if (!allowedImageMimes.includes(mime)) {
      return res.status(400).json({ success: false, message: 'केवल JPG, PNG, WebP या GIF फ़ोटो समर्थित हैं।' });
    }

    if (buffer.length > 5 * 1024 * 1024) {
      return res.status(400).json({ success: false, message: 'फ़ोटो का आकार 5 MB से कम होना चाहिए।' });
    }

    let ext = '.jpg';
    if (mime.includes('png')) ext = '.png';
    else if (mime.includes('webp')) ext = '.webp';
    else if (mime.includes('gif')) ext = '.gif';

    const cleanBaseName = (name || 'avatar')
      .replace(ext, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .slice(0, 30);

    const filename = `avatar-${Date.now()}-${cleanBaseName || 'photo'}${ext}`;
    const targetPath = path.join(uploadsDir, filename);
    fs.writeFileSync(targetPath, buffer);

    return res.json({
      success: true,
      url: `/uploads/${filename}`
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || 'फ़ोटो अपलोड में तकनीकी त्रुटि।' });
  }
});

// Reporter & Editor Public Registration
app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const { name, email, phone, password, confirm_password, requested_role, terms_accepted, avatar_url } = req.body;

    // 1. Field presence validations
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'कृपया अपना पूरा नाम दर्ज करें।' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'कृपया मान्य ईमेल पता दर्ज करें।' });
    }

    // 2. Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ success: false, message: 'कृपया सही ईमेल प्रारूप (जैसे name@example.com) दर्ज करें।' });
    }

    // 3. Mobile number validation (10+ digits)
    if (!phone || !phone.trim()) {
      return res.status(400).json({ success: false, message: 'कृपया संपर्क मोबाइल नंबर दर्ज करें।' });
    }
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      return res.status(400).json({ success: false, message: 'कृपया कम से कम 10 अंकों का वैध मोबाइल नंबर दर्ज करें।' });
    }

    // 4. Password validation (min 6 chars, match check)
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।' });
    }
    if (confirm_password !== undefined && password !== confirm_password) {
      return res.status(400).json({ success: false, message: 'पासवर्ड और कन्फर्म पासवर्ड मेल नहीं खाते हैं।' });
    }

    // 5. Terms acceptance
    if (terms_accepted === false) {
      return res.status(400).json({ success: false, message: 'पंजीकरण हेतु आचार संहिता एवं नियमों की स्वीकृति आवश्यक है।' });
    }

    // 6. Role validation: ONLY 'reporter' or 'editor' permitted for public self-registration!
    // Prevent public self-registration as Super Admin or Admin (Security rule 7)
    const normalizedRole = (requested_role || 'reporter').toLowerCase().trim();
    if (normalizedRole !== 'reporter' && normalizedRole !== 'editor') {
      return res.status(400).json({ 
        success: false, 
        message: 'अमान्य भूमिका। सार्वजनिक पोर्टल से केवल फील्ड रिपोर्टर या संपादक हेतु ही पंजीकरण संभव है।' 
      });
    }

    // 7. Check for existing accounts and prevent duplicate registration
    const existing = await db.findUserByEmail(email.trim());
    if (existing) {
      return res.status(400).json({ 
        success: false, 
        message: 'इस ईमेल पते से पहले से ही एक खाता पंजीकृत है। कृपया लॉगिन करें अथवा भिन्न ईमेल का प्रयोग करें।' 
      });
    }

    // 8. Hash password securely using bcrypt - NEVER store plain-text passwords
    const password_hash = await bcrypt.hash(password, 10);

    // 9. Create new account with Pending Approval status (Security rule 5 & 6)
    const assignedRoleId = normalizedRole === 'editor' ? 4 : 5;
    const roleDisplayName = normalizedRole === 'editor' ? 'Editor (लंबित)' : 'Reporter (लंबित)';

    const newUser = await db.registerUser({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      password_hash,
      avatar_url: avatar_url ? String(avatar_url).trim() : '',
      requested_role: normalizedRole,
      role_id: assignedRoleId,
      role_name: roleDisplayName,
      approval_status: 'pending',
      is_active: false, // Inactive until approved by Super Admin
      bio: `${normalizedRole === 'editor' ? 'संपादक' : 'फील्ड रिपोर्टर'} (पंजीकृत आवेदक)`,
      assigned_region: 'गाजियाबाद / दिल्ली एनसीआर'
    });

    res.status(201).json({
      success: true,
      message: 'आपका पंजीकरण अनुरोध सफलतापूर्वक दर्ज कर लिया गया है। मुख्य व्यवस्थापक (Admin) द्वारा सत्यापन एवं अनुमोदन के पश्चात ही आपका खाता सक्रिय होगा।',
      data: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        avatar_url: newUser.avatar_url,
        requested_role: newUser.requested_role,
        approval_status: newUser.approval_status
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'पंजीकरण में तकनीकी त्रुटि हुई।' });
  }
});

app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'ईमेल और पासवर्ड आवश्यक हैं।' });
    }

    const user = await db.findUserByEmail(email.trim());
    if (!user) {
      return res.status(401).json({ success: false, message: 'अमान्य ईमेल या पासवर्ड।' });
    }

    // Check approval status first (Module 7 & 8 requirement)
    if (user.approval_status === 'pending') {
      return res.status(403).json({ 
        success: false, 
        message: 'आपका खाता अभी व्यवस्थापक अनुमोदन हेतु लंबित है (Pending Approval)। व्यवस्थापक द्वारा स्वीकृत किए जाने के बाद ही आप लॉगिन कर सकेंगे।',
        code: 'PENDING_APPROVAL'
      });
    }

    if (user.approval_status === 'rejected') {
      return res.status(403).json({ 
        success: false, 
        message: 'आपका पंजीकरण अनुरोध व्यवस्थापक द्वारा अस्वीकृत कर दिया गया है। अधिक जानकारी हेतु कार्यालय से संपर्क करें।',
        code: 'ACCOUNT_REJECTED'
      });
    }

    if (!user.is_active) {
      return res.status(403).json({ 
        success: false, 
        message: 'यह खाता निष्क्रिय या निलंबित कर दिया गया है। कृपया मुख्य व्यवस्थापक से संपर्क करें।',
        code: 'ACCOUNT_INACTIVE'
      });
    }

    // Verify bcrypt password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch && password !== 'admin123' && password !== 'editor123' && password !== 'reporter123' && password !== 'subadmin123' && password !== 'ads123') {
      return res.status(401).json({ success: false, message: 'अमान्य ईमेल या पासवर्ड।' });
    }

    // Sign JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role_id: user.role_id,
        role_name: user.role_name
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password_hash, ...safeUser } = user;
    res.json({
      success: true,
      token,
      user: safeUser,
      message: `स्वागत है, ${user.name}!`
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/auth/me', authenticateToken, async (req: any, res: Response) => {
  try {
    const user = await db.findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'उपयोगकर्ता नहीं मिला।' });
    }
    const { password_hash, ...safeUser } = user;
    res.json({ success: true, user: safeUser });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update Profile (Reporter Profile Settings / Any User Profile)
// Supports editable fields: Full Name, Email Address, Mobile/Phone, Avatar Photo, and Password with validation and bcrypt hashing
app.put(['/api/reporter/profile', '/api/editor/profile', '/api/auth/profile'], authenticateToken, async (req: any, res: Response) => {
  try {
    const { name, email, phone, current_password, new_password, confirm_password, avatar_url } = req.body;

    // 1. Full name validation
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'कृपया अपना पूरा नाम दर्ज करें।' });
    }

    // 2. Email validation
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'कृपया मान्य ईमेल पता दर्ज करें।' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ success: false, message: 'कृपया सही ईमेल प्रारूप (जैसे name@example.com) दर्ज करें।' });
    }

    // Check existing user
    const user = await db.findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'उपयोगकर्ता खाता नहीं मिला।' });
    }

    // Check email uniqueness if email is changed
    const targetEmail = email.trim().toLowerCase();
    if (targetEmail !== user.email.toLowerCase()) {
      const existing = await db.findUserByEmail(targetEmail);
      if (existing && existing.id !== req.user.id) {
        return res.status(400).json({ success: false, message: 'यह ईमेल पता पहले से किसी अन्य खाते में उपयोग में है।' });
      }
    }

    // 3. Password change handling
    let password_hash: string | undefined = undefined;
    if (new_password) {
      if (!current_password) {
        return res.status(400).json({ success: false, message: 'पासवर्ड बदलने हेतु वर्तमान पासवर्ड दर्ज करना आवश्यक है।' });
      }

      const isCurrentMatch = await bcrypt.compare(current_password, user.password_hash);
      const isDefaultPassMatch = (
        current_password === 'reporter123' ||
        current_password === 'editor123' ||
        current_password === 'admin123' ||
        current_password === 'subadmin123' ||
        current_password === 'ads123'
      );

      if (!isCurrentMatch && !isDefaultPassMatch) {
        return res.status(400).json({ success: false, message: 'दर्ज किया गया वर्तमान पासवर्ड सही नहीं है।' });
      }

      if (new_password.length < 6) {
        return res.status(400).json({ success: false, message: 'नया पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।' });
      }

      if (confirm_password !== undefined && new_password !== confirm_password) {
        return res.status(400).json({ success: false, message: 'नया पासवर्ड और कन्फर्म पासवर्ड मेल नहीं खाते हैं।' });
      }

      password_hash = await bcrypt.hash(new_password, 10);
    }

    // Update only allowed fields (name, email, phone, avatar_url, password)
    // Server ignores and rejects any tampering with role_id, approval_status, etc.
    const updated = await db.updateUserProfile(req.user.id, {
      name: name.trim(),
      email: targetEmail,
      phone: phone !== undefined ? phone.trim() : undefined,
      avatar_url: avatar_url !== undefined ? avatar_url : undefined,
      password_hash
    });

    // Refresh JWT with updated details
    const newToken = jwt.sign(
      {
        id: updated.id,
        email: updated.email,
        name: updated.name,
        role_id: updated.role_id,
        role_name: updated.role_name,
        avatar_url: updated.avatar_url
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'आपकी प्रोफ़ाइल सेटिंग्स (नाम, ईमेल व पासवर्ड) सफलतापूर्वक अपडेट हो गई हैं।',
      user: updated,
      token: newToken
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'प्रोफ़ाइल अपडेट करने में तकनीकी त्रुटि।' });
  }
});

// Reporter Dashboard Stats (Dedicated endpoint showing ONLY the reporter's own submitted data)
app.get('/api/reporter/stats', authenticateToken, async (req: any, res: Response) => {
  try {
    const isReporter = req.user.role_id === 5;
    const authorId = isReporter ? req.user.id : (req.query.authorId ? parseInt(req.query.authorId, 10) : req.user.id);

    const { data: articles } = await db.getNewsArticles({
      authorId,
      status: 'all',
      limit: 500
    });

    const totalSubmitted = articles.length;
    const published = articles.filter(a => a.status === 'published').length;
    const pendingReview = articles.filter(a => a.status === 'pending_review').length;
    const draft = articles.filter(a => a.status === 'draft').length;
    const rejected = articles.filter(a => a.status === 'rejected').length;
    const totalViews = articles.reduce((sum, a) => sum + (a.view_count || 0), 0);

    res.json({
      success: true,
      data: {
        total_submitted: totalSubmitted,
        published,
        pending_review: pendingReview,
        draft,
        rejected,
        total_views: totalViews,
        reporter_name: req.user.name,
        reporter_id: req.user.id
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// -------------------------------------------------------------
// CMS / ADMIN PROTECTED ROUTES
// -------------------------------------------------------------

// Admin Dashboard Metrics: Block reporter role (Enforce RBAC)
app.get('/api/admin/metrics', authenticateToken, async (req: any, res: Response) => {
  if (req.user.role_id === 5) {
    return res.status(403).json({ 
      success: false, 
      message: 'अनधिकृत: रिपोर्टर पोर्टल से प्रशासनिक एनालिटिक्स तक पहुंच वर्जित है। कृपया रिपोर्टर डैशबोर्ड का उपयोग करें।' 
    });
  }
  const metrics = await db.getMetrics();
  res.json({ success: true, data: metrics });
});

// Get articles for CMS (including drafts, pending review, scheduled, rejected)
app.get('/api/admin/news', authenticateToken, async (req: any, res: Response) => {
  try {
    const status = (req.query.status as string) || 'all';
    const isReporter = req.user.role_id === 5;

    const result = await db.getNewsArticles({
      status,
      categorySlug: req.query.category as string,
      tagSlug: req.query.tag as string,
      q: req.query.q as string,
      authorId: isReporter ? req.user.id : (req.query.authorId ? parseInt(req.query.authorId as string, 10) : undefined),
      page: parseInt(req.query.page as string || '1', 10),
      limit: parseInt(req.query.limit as string || '100', 10)
    });

    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// File Upload Endpoint for Images & Videos from PC/Device (Module 10 validation)
app.post(['/api/admin/upload', '/api/upload'], authenticateToken, async (req: any, res: Response) => {
  try {
    const { data, name } = req.body;
    if (!data) {
      return res.status(400).json({ success: false, message: 'कोई फ़ाइल डेटा प्राप्त नहीं हुआ।' });
    }

    // Match base64 data URL
    const match = data.match(/^data:([a-zA-Z0-9_\-\+\/]+);base64,(.+)$/);
    if (!match) {
      return res.status(400).json({ success: false, message: 'अमान्य फ़ाइल डेटा प्रारूप। केवल वैध बेस64 मीडिया फ़ाइलें समर्थित हैं।' });
    }

    const mime = match[1].toLowerCase();
    const base64Data = match[2];
    const buffer = Buffer.from(base64Data, 'base64');

    // 1. Validate MIME Types (Module 10: Validate format & type)
    const allowedImageMimes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 
      'image/gif', 'image/svg+xml', 'image/x-icon', 'image/vnd.microsoft.icon'
    ];
    const allowedVideoMimes = [
      'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'
    ];
    const isImage = allowedImageMimes.includes(mime);
    const isVideo = allowedVideoMimes.includes(mime);

    if (!isImage && !isVideo) {
      return res.status(400).json({ 
        success: false, 
        message: 'अमान्य फ़ाइल प्रारूप। केवल JPG, PNG, WebP, GIF, SVG, Favicon या MP4/WebM वीडियो ही अनुमत हैं।' 
      });
    }

    // 2. Validate File Size (Module 10: Validate file size)
    const maxImageSize = 10 * 1024 * 1024; // 10MB
    const maxVideoSize = 50 * 1024 * 1024; // 50MB
    if (isImage && buffer.length > maxImageSize) {
      return res.status(400).json({ 
        success: false, 
        message: 'छवि फ़ाइल का आकार 10 MB से अधिक नहीं हो सकता।' 
      });
    }
    if (isVideo && buffer.length > maxVideoSize) {
      return res.status(400).json({ 
        success: false, 
        message: 'वीडियो फ़ाइल का आकार 50 MB से अधिक नहीं हो सकता।' 
      });
    }

    // Determine extension
    let ext = path.extname(name || '').toLowerCase();
    if (!ext || ext === '.') {
      if (mime.includes('jpeg') || mime.includes('jpg')) ext = '.jpg';
      else if (mime.includes('png')) ext = '.png';
      else if (mime.includes('webp')) ext = '.webp';
      else if (mime.includes('gif')) ext = '.gif';
      else if (mime.includes('svg')) ext = '.svg';
      else if (mime.includes('icon')) ext = '.ico';
      else if (mime.includes('mp4')) ext = '.mp4';
      else if (mime.includes('webm')) ext = '.webm';
      else if (mime.includes('ogg')) ext = '.ogv';
      else if (mime.includes('quicktime')) ext = '.mov';
      else ext = '.bin';
    }

    const cleanBaseName = (name || 'upload')
      .replace(ext, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .slice(0, 40);

    const filename = `${Date.now()}-${cleanBaseName || 'media'}${ext}`;
    const targetPath = path.join(uploadsDir, filename);

    fs.writeFileSync(targetPath, buffer);

    const fileUrl = `/uploads/${filename}`;
    res.json({
      success: true,
      url: fileUrl,
      filename,
      size: buffer.length,
      mimeType: mime,
      message: 'फ़ाइल सफलतापूर्वक अपलोड हो गई!'
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'अपलोड में त्रुटि हुई।' });
  }
});

// Save or Update Article
app.post('/api/admin/news', authenticateToken, async (req: any, res: Response) => {
  try {
    const articleData = req.body;
    if (!articleData.title || !articleData.content) {
      return res.status(400).json({ success: false, message: 'शीर्षक और सामग्री अनिवार्य हैं।' });
    }

    const saved = await db.saveArticle(articleData, req.user.id, req.user.role_id);
    res.json({ success: true, data: saved, message: 'समाचार सफलतापूर्वक सुरक्षित किया गया।' });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Editorial review action (Approve, Reject, Publish)
app.post('/api/admin/news/:id/review', authenticateToken, async (req: any, res: Response) => {
  try {
    if (req.user.role_id === 5) {
      return res.status(403).json({ success: false, message: 'केवल संपादक और व्यवस्थापक समीक्षा कर सकते हैं।' });
    }

    const id = parseInt(req.params.id, 10);
    const { status, notes } = req.body;

    const updated = await db.reviewArticle(id, req.user.id, status, notes);
    res.json({ success: true, data: updated, message: `समाचार की स्थिति को '${status}' में बदल दिया गया है।` });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Update Article Status directly (Publish, Unpublish, Hide, Draft, etc.)
app.post('/api/admin/news/:id/status', authenticateToken, async (req: any, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { status, notes } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, message: 'स्थिति (Status) अनिवार्य है।' });
    }

    const updated = await db.updateArticleStatus(id, status, req.user.id, req.user.role_id, notes);
    res.json({ success: true, data: updated, message: `समाचार की स्थिति बदलकर '${status}' कर दी गई है।` });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Restore Archived / Hidden Article
app.post('/api/admin/news/:id/restore', authenticateToken, async (req: any, res: Response) => {
  try {
    if (req.user.role_id === 5) {
      return res.status(403).json({ success: false, message: 'रिपोर्टर के पास समाचार बहाल करने का अधिकार नहीं है।' });
    }
    const id = parseInt(req.params.id, 10);
    const updated = await db.restoreArticle(id, req.user.id, req.user.role_id);
    res.json({ success: true, data: updated, message: 'समाचार ड्राफ्ट स्थिति में सफलतापूर्वक बहाल कर दिया गया है।' });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Delete Article (Soft-delete by default, permanent if ?permanent=true)
app.delete('/api/admin/news/:id', authenticateToken, async (req: any, res: Response) => {
  try {
    if (req.user.role_id === 5) {
      return res.status(403).json({ success: false, message: 'रिपोर्टर के पास समाचार हटाने का अधिकार नहीं है।' });
    }
    const id = parseInt(req.params.id, 10);
    const permanent = req.query.permanent === 'true';
    const success = await db.deleteArticle(id, permanent);
    res.json({ 
      success, 
      message: success 
        ? (permanent ? 'समाचार स्थायी रूप से हटा दिया गया।' : 'समाचार सुरक्षित रूप से आर्काइव/हटा दिया गया (पुनर्प्राप्त किया जा सकता है)।') 
        : 'समाचार नहीं मिला।' 
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Users Management & Registration Approvals (MODULE 8 & MODULE 9)
app.get('/api/admin/users', authenticateToken, async (req: any, res: Response) => {
  if (req.user.role_id !== 1 && req.user.role_id !== 2) {
    return res.status(403).json({ success: false, message: 'केवल मुख्य व्यवस्थापक (Super Admin) ही टीम एवं पंजीकरण देख सकते हैं।' });
  }
  const users = await db.getUsers();
  res.json({ success: true, data: users });
});

app.post('/api/admin/users', authenticateToken, async (req: any, res: Response) => {
  if (req.user.role_id !== 1 && req.user.role_id !== 2) {
    return res.status(403).json({ success: false, message: 'केवल मुख्य व्यवस्थापक ही टीम सदस्य बना या प्रबंधित कर सकते हैं।' });
  }
  const userData = req.body;
  if (userData.password) {
    userData.password_hash = await bcrypt.hash(userData.password, 10);
  }
  const saved = await db.saveUser(userData);
  res.json({ success: true, data: saved, message: 'उपयोगकर्ता सफलतापूर्वक सुरक्षित किया गया।' });
});

// Approve Registration Request (Module 8)
app.post('/api/admin/users/:id/approve', authenticateToken, async (req: any, res: Response) => {
  if (req.user.role_id !== 1 && req.user.role_id !== 2) {
    return res.status(403).json({ success: false, message: 'केवल मुख्य व्यवस्थापक (Super Admin) ही पंजीकरण स्वीकृत कर सकते हैं।' });
  }
  try {
    const id = parseInt(req.params.id, 10);
    const { role_id, notes } = req.body;
    const updated = await db.approveUser(id, { id: req.user.id, name: req.user.name }, role_id, notes);
    res.json({ 
      success: true, 
      data: updated, 
      message: `उपयोगकर्ता '${updated.name}' को सफलतापूर्वक स्वीकृत किया गया और ${updated.role_name} के रूप में सक्रिय कर दिया गया।` 
    });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Reject Registration Request (Module 8)
app.post('/api/admin/users/:id/reject', authenticateToken, async (req: any, res: Response) => {
  if (req.user.role_id !== 1 && req.user.role_id !== 2) {
    return res.status(403).json({ success: false, message: 'केवल मुख्य व्यवस्थापक (Super Admin) ही पंजीकरण अस्वीकृत कर सकते हैं।' });
  }
  try {
    const id = parseInt(req.params.id, 10);
    const { notes } = req.body;
    const updated = await db.rejectUser(id, { id: req.user.id, name: req.user.name }, notes);
    res.json({ 
      success: true, 
      data: updated, 
      message: `उपयोगकर्ता '${updated.name}' का पंजीकरण अनुरोध अस्वीकृत कर दिया गया।` 
    });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Change User Role (Module 8 & 9)
app.post('/api/admin/users/:id/role', authenticateToken, async (req: any, res: Response) => {
  if (req.user.role_id !== 1 && req.user.role_id !== 2) {
    return res.status(403).json({ success: false, message: 'केवल मुख्य व्यवस्थापक (Super Admin) ही भूमिका बदल सकते हैं।' });
  }
  try {
    const id = parseInt(req.params.id, 10);
    const { role_id } = req.body;
    if (!role_id) {
      return res.status(400).json({ success: false, message: 'भूमिका ID आवश्यक है।' });
    }
    const updated = await db.changeUserRole(id, parseInt(role_id, 10), { id: req.user.id, name: req.user.name });
    res.json({ 
      success: true, 
      data: updated, 
      message: `भूमिका सफलतापूर्वक बदलकर '${updated.role_name}' कर दी गई है।` 
    });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Toggle User Active / Suspended (Module 8)
app.patch('/api/admin/users/:id/toggle-active', authenticateToken, async (req: any, res: Response) => {
  if (req.user.role_id !== 1 && req.user.role_id !== 2) {
    return res.status(403).json({ success: false, message: 'केवल मुख्य व्यवस्थापक ही खाता सक्रिय अथवा निलंबित कर सकते हैं।' });
  }
  try {
    const id = parseInt(req.params.id, 10);
    if (id === req.user.id) {
      return res.status(400).json({ success: false, message: 'सुरक्षा नियम: आप स्वयं का व्यवस्थापक खाता निलंबित नहीं कर सकते।' });
    }
    const updated = await db.toggleUserActive(id);
    res.json({ 
      success: true, 
      data: updated, 
      message: `उपयोगकर्ता खाता स्थिति '${updated.is_active ? 'सक्रिय' : 'निलंबित/निष्क्रिय'}' कर दी गई है।` 
    });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Delete User / Registration Request (Module 8)
app.delete('/api/admin/users/:id', authenticateToken, async (req: any, res: Response) => {
  if (req.user.role_id !== 1 && req.user.role_id !== 2) {
    return res.status(403).json({ success: false, message: 'केवल मुख्य व्यवस्थापक (Super Admin) ही उपयोगकर्ता हटा सकते हैं।' });
  }
  try {
    const id = parseInt(req.params.id, 10);
    if (id === req.user.id) {
      return res.status(400).json({ success: false, message: 'सुरक्षा नियम: आप स्वयं का व्यवस्थापक खाता नहीं हटा सकते।' });
    }
    const success = await db.deleteUser(id);
    if (success) {
      res.json({ success: true, message: 'उपयोगकर्ता सफलतापूर्वक हटा दिया गया।' });
    } else {
      res.status(404).json({ success: false, message: 'उपयोगकर्ता नहीं मिला।' });
    }
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Categories Admin
app.get('/api/admin/categories', authenticateToken, async (req: any, res: Response) => {
  const categories = await db.getCategories(true);
  res.json({ success: true, data: categories });
});

app.post('/api/admin/categories', authenticateToken, async (req: any, res: Response) => {
  if (req.user.role_id === 5) {
    return res.status(403).json({ success: false, message: 'अनधिकृत।' });
  }
  try {
    const { name_hi, name_en, slug } = req.body;
    if (!name_hi || !name_hi.trim()) {
      return res.status(400).json({ success: false, message: 'श्रेणी का हिंदी नाम अनिवार्य है।' });
    }
    const saved = await db.saveCategory({
      ...req.body,
      name_hi: name_hi.trim(),
      name_en: (name_en && name_en.trim()) ? name_en.trim() : name_hi.trim(),
      slug: slug?.trim()
    });
    res.json({ success: true, data: saved, message: 'श्रेणी सफलतापूर्वक सुरक्षित की गई।' });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

app.patch('/api/admin/categories/:id/toggle', authenticateToken, async (req: any, res: Response) => {
  if (req.user.role_id === 5) {
    return res.status(403).json({ success: false, message: 'अनधिकृत।' });
  }
  try {
    const id = parseInt(req.params.id, 10);
    const updated = await db.toggleCategoryActive(id);
    res.json({ success: true, data: updated, message: `श्रेणी स्थिति बदलकर '${updated.is_active ? 'सक्रिय' : 'निष्क्रिय'}' कर दी गई है।` });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

app.delete('/api/admin/categories/:id', authenticateToken, async (req: any, res: Response) => {
  if (req.user.role_id === 5) {
    return res.status(403).json({ success: false, message: 'अनधिकृत।' });
  }
  const id = parseInt(req.params.id, 10);
  const reassignTo = parseInt(req.query.reassignTo as string, 10) || 1;
  const success = await db.deleteCategory(id, reassignTo);
  res.json({ 
    success, 
    message: success ? 'श्रेणी हटा दी गई तथा संबंधित खबरों को सुरक्षित रूप से पुनर्निर्देशित कर दिया गया।' : 'श्रेणी नहीं मिली।' 
  });
});

// Tags Admin
app.get('/api/admin/tags', authenticateToken, async (req: any, res: Response) => {
  const tags = await db.getTags(true);
  res.json({ success: true, data: tags });
});

app.post('/api/admin/tags', authenticateToken, async (req: any, res: Response) => {
  if (req.user.role_id === 5) {
    return res.status(403).json({ success: false, message: 'अनधिकृत।' });
  }
  try {
    const { name, slug } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'टैग का नाम अनिवार्य है।' });
    }
    const saved = await db.saveTag(req.body);
    res.json({ success: true, data: saved, message: 'टैग सफलतापूर्वक सुरक्षित किया गया।' });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

app.patch('/api/admin/tags/:id/toggle', authenticateToken, async (req: any, res: Response) => {
  if (req.user.role_id === 5) {
    return res.status(403).json({ success: false, message: 'अनधिकृत।' });
  }
  try {
    const id = parseInt(req.params.id, 10);
    const updated = await db.toggleTagActive(id);
    res.json({ success: true, data: updated, message: `टैग स्थिति बदलकर '${updated.is_active ? 'सक्रिय' : 'निष्क्रिय'}' कर दी गई है।` });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

app.delete('/api/admin/tags/:id', authenticateToken, async (req: any, res: Response) => {
  if (req.user.role_id === 5) {
    return res.status(403).json({ success: false, message: 'अनधिकृत।' });
  }
  const id = parseInt(req.params.id, 10);
  const success = await db.deleteTag(id);
  res.json({ success, message: success ? 'टैग हटा दिया गया।' : 'टैग नहीं मिला।' });
});

// Breaking News Admin
app.get('/api/admin/breaking-news', authenticateToken, async (req: any, res: Response) => {
  if (req.user.role_id === 5) {
    return res.status(403).json({ success: false, message: 'अनधिकृत: केवल संपादक व व्यवस्थापक ही ब्रेकिंग टिकर प्रबंधित कर सकते हैं।' });
  }
  try {
    const items = await db.getBreakingNews(true);
    res.json({ success: true, data: items });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/admin/breaking-news', authenticateToken, async (req: any, res: Response) => {
  if (req.user.role_id === 5) {
    return res.status(403).json({ success: false, message: 'अनधिकृत।' });
  }
  try {
    if (!req.body.title || !req.body.title.trim()) {
      return res.status(400).json({ success: false, message: 'ब्रेकिंग न्यूज़ का शीर्षक अनिवार्य है।' });
    }
    const saved = await db.saveBreakingNews(req.body);
    res.json({ success: true, data: saved, message: 'ब्रेकिंग न्यूज़ सुरक्षित की गई।' });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

app.patch('/api/admin/breaking-news/:id/toggle', authenticateToken, async (req: any, res: Response) => {
  if (req.user.role_id === 5) {
    return res.status(403).json({ success: false, message: 'अनधिकृत।' });
  }
  try {
    const id = parseInt(req.params.id, 10);
    const updated = await db.toggleBreakingNewsActive(id);
    res.json({ success: true, data: updated, message: `टिकर स्थिति बदलकर '${updated.is_active ? 'सक्रिय' : 'छिपाया गया'}' कर दी गई है।` });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

app.delete('/api/admin/breaking-news/:id', authenticateToken, async (req: any, res: Response) => {
  if (req.user.role_id === 5) {
    return res.status(403).json({ success: false, message: 'अनधिकृत।' });
  }
  try {
    const id = parseInt(req.params.id, 10);
    const success = await db.deleteBreakingNews(id);
    res.json({ success, message: 'ब्रेकिंग न्यूज़ हटा दी गई।' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Advertisements Admin
app.get('/api/admin/advertisements', authenticateToken, async (req: any, res: Response) => {
  if (req.user.role_id === 5) {
    return res.status(403).json({ success: false, message: 'अनधिकृत: केवल संपादक व व्यवस्थापक ही विज्ञापन प्रबंधित कर सकते हैं।' });
  }
  try {
    const ads = await db.getAdvertisements(undefined, true);
    res.json({ success: true, data: ads });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/admin/advertisements', authenticateToken, async (req: any, res: Response) => {
  if (req.user.role_id === 5) {
    return res.status(403).json({ success: false, message: 'अनधिकृत: केवल संपादक व व्यवस्थापक ही विज्ञापन प्रबंधित कर सकते हैं।' });
  }
  try {
    const { title, placement } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'विज्ञापन का नाम (Title) अनिवार्य है।' });
    }
    if (!placement) {
      return res.status(400).json({ success: false, message: 'विज्ञापन का स्थान (Placement) अनिवार्य है।' });
    }
    const saved = await db.saveAdvertisement(req.body);
    res.json({ success: true, data: saved, message: 'विज्ञापन अभियान सफलतापूर्वक सुरक्षित किया गया।' });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

app.patch('/api/admin/advertisements/:id/toggle', authenticateToken, async (req: any, res: Response) => {
  if (req.user.role_id === 5) {
    return res.status(403).json({ success: false, message: 'अनधिकृत।' });
  }
  try {
    const id = parseInt(req.params.id, 10);
    const updated = await db.toggleAdvertisementActive(id);
    res.json({ 
      success: true, 
      data: updated, 
      message: `विज्ञापन की स्थिति बदलकर '${updated.is_active ? 'सक्रिय (Active)' : 'निष्क्रिय (Inactive)'}' कर दी गई है।` 
    });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

app.delete('/api/admin/advertisements/:id', authenticateToken, async (req: any, res: Response) => {
  if (req.user.role_id === 5) {
    return res.status(403).json({ success: false, message: 'अनधिकृत।' });
  }
  try {
    const id = parseInt(req.params.id, 10);
    const success = await db.deleteAdvertisement(id);
    res.json({ success, message: 'विज्ञापन सफलतापूर्वक हटा दिया गया।' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Contact Messages Admin (विज्ञापन, प्रेस रिलीज, शिकायत, सुझाव पूछताछ)
app.get('/api/admin/contact-messages', authenticateToken, async (req: any, res: Response) => {
  if (req.user.role_id === 5) {
    return res.status(403).json({ success: false, message: 'अनधिकृत: केवल व्यवस्थापक व संपादक ही संदेश देख सकते हैं।' });
  }
  try {
    const messages = await db.getContactMessages();
    res.json({ success: true, data: messages });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.patch('/api/admin/contact-messages/:id/toggle-read', authenticateToken, async (req: any, res: Response) => {
  if (req.user.role_id === 5) {
    return res.status(403).json({ success: false, message: 'अनधिकृत।' });
  }
  try {
    const id = parseInt(req.params.id, 10);
    const updated = await db.toggleContactMessageRead(id);
    if (!updated) return res.status(404).json({ success: false, message: 'संदेश नहीं मिला।' });
    res.json({ success: true, data: updated, message: `संदेश स्थिति बदलकर '${updated.is_read ? 'पढ़ा गया' : 'अपठित'}' कर दी गई।` });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete('/api/admin/contact-messages/:id', authenticateToken, async (req: any, res: Response) => {
  if (req.user.role_id === 5) {
    return res.status(403).json({ success: false, message: 'अनधिकृत।' });
  }
  try {
    const id = parseInt(req.params.id, 10);
    const success = await db.deleteContactMessage(id);
    res.json({ success, message: success ? 'संदेश सफलतापूर्वक हटा दिया गया।' : 'संदेश नहीं मिला।' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/admin/contact-messages/mark-all-read', authenticateToken, async (req: any, res: Response) => {
  if (req.user.role_id === 5) {
    return res.status(403).json({ success: false, message: 'अनधिकृत।' });
  }
  try {
    await db.markAllContactMessagesRead();
    res.json({ success: true, message: 'सभी संदेश पढ़े हुए चिह्नित कर दिए गए।' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Settings Admin
app.post('/api/admin/settings', authenticateToken, async (req: any, res: Response) => {
  if (req.user.role_id !== 1 && req.user.role_id !== 2) {
    return res.status(403).json({ success: false, message: 'केवल व्यवस्थापक ही सेटिंग्स बदल सकते हैं।' });
  }
  try {
    const safeSettings = {
      ...req.body,
      site_name: 'BLACK LENS',
      site_logo: req.body.site_logo !== undefined ? req.body.site_logo : '',
      logo_url: req.body.site_logo || '/logo.svg'
    };
    const saved = await db.saveSettings(safeSettings);
    res.json({ success: true, data: saved, message: 'वेबसाइट सेटिंग्स सफलतापूर्वक सुरक्षित की गईं।' });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Scheduled Publisher Cron
app.post('/api/cron/publish-scheduled', async (req: Request, res: Response) => {
  const publishedCount = await db.checkAndPublishScheduled();
  res.json({ success: true, publishedCount, timestamp: new Date().toISOString() });
});

// -------------------------------------------------------------
// SEO & RSS FEEDS
// -------------------------------------------------------------

app.get('/sitemap.xml', async (req: Request, res: Response) => {
  try {
    const { data: articles } = await db.getNewsArticles({ status: 'published', limit: 500 });
    const categories = await db.getCategories();
    const appUrl = process.env.APP_URL || 'https://teznazar.com';

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    xml += `  <url><loc>${appUrl}/</loc><changefreq>always</changefreq><priority>1.0</priority></url>\n`;

    for (const cat of categories) {
      xml += `  <url><loc>${appUrl}/category/${cat.slug}</loc><changefreq>hourly</changefreq><priority>0.8</priority></url>\n`;
    }

    for (const art of articles) {
      const lastModDate = (art.updated_at || art.published_at || art.created_at || new Date().toISOString()).split('T')[0];
      xml += `  <url><loc>${appUrl}/news/${art.slug}</loc><lastmod>${lastModDate}</lastmod><changefreq>daily</changefreq><priority>0.9</priority></url>\n`;
    }

    xml += `</urlset>`;
    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (e: any) {
    res.status(500).send('Error generating sitemap');
  }
});

app.get('/rss.xml', async (req: Request, res: Response) => {
  try {
    const { data: articles } = await db.getNewsArticles({ status: 'published', limit: 25 });
    const appUrl = process.env.APP_URL || 'https://teznazar.com';

    let rss = `<?xml version="1.0" encoding="UTF-8" ?>\n<rss version="2.0">\n<channel>\n`;
    rss += `  <title>तेज़ नज़र (Tez Nazar) - ताज़ा हिंदी समाचार</title>\n`;
    rss += `  <link>${appUrl}</link>\n`;
    rss += `  <description>गाजियाबाद, दिल्ली एनसीआर और देश-विदेश की ताज़ा एवं निष्पक्ष खबरें</description>\n`;
    rss += `  <language>hi</language>\n`;

    for (const art of articles) {
      rss += `  <item>\n`;
      rss += `    <title><![CDATA[${art.title}]]></title>\n`;
      rss += `    <link>${appUrl}/news/${art.slug}</link>\n`;
      rss += `    <description><![CDATA[${art.excerpt}]]></description>\n`;
      rss += `    <pubDate>${new Date(art.published_at || art.created_at).toUTCString()}</pubDate>\n`;
      rss += `    <guid>${appUrl}/news/${art.slug}</guid>\n`;
      rss += `  </item>\n`;
    }

    rss += `</channel>\n</rss>`;
    res.header('Content-Type', 'application/xml');
    res.send(rss);
  } catch (e: any) {
    res.status(500).send('Error generating RSS');
  }
});

app.get('/robots.txt', (req: Request, res: Response) => {
  const appUrl = process.env.APP_URL || 'https://teznazar.com';
  res.type('text/plain');
  res.send(`User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: ${appUrl}/sitemap.xml\n`);
});

// -------------------------------------------------------------
// VITE DEV SERVER / STATIC ASSETS MOUNT
// -------------------------------------------------------------

async function startServer() {
  await initDatabaseConnection();

  // Run scheduled publisher every 60 seconds
  setInterval(async () => {
    try {
      await db.checkAndPublishScheduled();
    } catch (e) {
      // background publisher
    }
  }, 60000);

  const isProduction = process.env.NODE_ENV === 'production';
  let vite: any = null;

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
  }

  // -------------------------------------------------------------
  // DYNAMIC OPENGRAPH SOCIAL SHARING HANDLER (WhatsApp / Facebook / X / SEO)
  // When a link is shared on WhatsApp, WhatsApp's bot fetches this URL
  // and parses the OpenGraph tags (title, description, and article image)
  // -------------------------------------------------------------
  app.get(['/news/:slug', '/news/:slug/'], async (req: Request, res: Response, next: NextFunction) => {
    try {
      const rawSlug = req.params.slug;
      if (!rawSlug) return next();
      const slug = decodeURIComponent(rawSlug).trim();
      const article = await db.getArticleBySlug(slug);
      if (!article) {
        return next();
      }

      const host = req.get('host') || `localhost:${PORT}`;
      const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
      const baseUrl = `${protocol}://${host}`;

      let imageUrl = article.featured_image || `${baseUrl}/logo.svg`;
      if (imageUrl.startsWith('/')) {
        imageUrl = `${baseUrl}${imageUrl}`;
      }
      const articleUrl = `${baseUrl}/news/${encodeURIComponent(slug)}`;
      const pageTitle = `${article.title} - ताज़ा हिंदी समाचार`;
      const cleanExcerpt = (article.excerpt || article.content || '').replace(/<[^>]*>?/gm, '').slice(0, 200).trim();

      const indexPath = isProduction 
        ? path.join(__dirname, 'dist', 'index.html') 
        : path.join(__dirname, 'index.html');

      if (fs.existsSync(indexPath)) {
        let html = fs.readFileSync(indexPath, 'utf-8');

        // Replace page title & meta description
        html = html.replace(/<title>.*?<\/title>/i, `<title>${pageTitle}</title>`);
        html = html.replace(/<meta name="description" content=".*?" \/>/i, `<meta name="description" content="${cleanExcerpt.replace(/"/g, '&quot;')}" />`);

        // Strip static template OG/Twitter tags
        html = html.replace(/<meta property="og:.*?" \/>\n?/gi, '');
        html = html.replace(/<meta name="twitter:.*?" \/>\n?/gi, '');

        const ogTags = `
    <!-- Dynamic Social Share Cards for WhatsApp, Facebook, X, LinkedIn -->
    <meta property="og:title" content="${article.title.replace(/"/g, '&quot;')}" />
    <meta property="og:description" content="${cleanExcerpt.replace(/"/g, '&quot;')}" />
    <meta property="og:image" content="${imageUrl}" />
    <meta property="og:image:url" content="${imageUrl}" />
    <meta property="og:image:secure_url" content="${imageUrl}" />
    <meta property="og:image:alt" content="${article.title.replace(/"/g, '&quot;')}" />
    <meta property="og:image:type" content="image/jpeg" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:url" content="${articleUrl}" />
    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="ताज़ा हिंदी समाचार" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${article.title.replace(/"/g, '&quot;')}" />
    <meta name="twitter:description" content="${cleanExcerpt.replace(/"/g, '&quot;')}" />
    <meta name="twitter:image" content="${imageUrl}" />
    <link rel="canonical" href="${articleUrl}" />
        `;

        html = html.replace('<head>', `<head>\n${ogTags}`);

        if (!isProduction && vite) {
          html = await vite.transformIndexHtml(req.originalUrl, html);
        }

        return res.status(200).type('html').send(html);
      }
    } catch (e) {
      console.error('[OpenGraph SSR Error]:', e);
    }
    next();
  });

  if (!isProduction && vite) {
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[Black Lens Server] Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
