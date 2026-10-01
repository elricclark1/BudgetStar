import { useState, useEffect, useMemo } from 'react'
import {
  MantineProvider,
  createTheme,
  Container,
  Title,
  Button,
  Group,
  Table,
  Text,
  TextInput,
  NumberInput,
  Select,
  MultiSelect,
  Textarea,
  Modal,
  Grid,
  AppShell,
  NavLink,
  Paper,
  Stack,
  Divider,
  Checkbox,
  ScrollArea,
  SimpleGrid,
  Box,
  Badge,
  Slider,
  Collapse,
  Burger,
  Progress,
  ActionIcon,
  Drawer,
  SegmentedControl,
  ThemeIcon,
  Code,
  Accordion,
  Alert
} from '@mantine/core'
import { DateInput } from '@mantine/dates'
import { useDisclosure } from '@mantine/hooks'
import { 
  IconPlus, 
  IconDashboard, 
  IconList, 
  IconSettings, 
  IconDatabase, 
  IconChevronDown, 
  IconChevronUp, 
  IconChartHistogram, 
  IconTrash, 
  IconFileDownload, 
  IconTarget, 
  IconRepeat, 
  IconX, 
  IconCar, 
  IconFilter, 
  IconPencil, 
  IconInfoCircle, 
  IconCoin, 
  IconCalculator, 
  IconPigMoney, 
  IconUpload, 
  IconDownload, 
  IconSearch,
  IconTrendingUp,
  IconReceipt,
  IconWallet,
  IconScale,
  IconCalendarStats,
  IconRefresh,
  IconUsers,
  IconCreditCard,
  IconAlertTriangle,
  IconCheck,
  IconDeviceFloppy,
  IconBrandGithub
} from '@tabler/icons-react'
import axios from 'axios'
import dayjs from 'dayjs'
import 'dayjs/locale/en'
import isBetween from 'dayjs/plugin/isBetween'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LabelList, ReferenceLine } from 'recharts'

dayjs.extend(isBetween)
dayjs.extend(customParseFormat)

const CATEGORY_COLORS = {
  'Groceries': '#10B981',      // Green
  'Subscription': '#B91C1C',   // Deep Red
  'Eat out': '#F59E0B',        // Orange
  'Fuel': '#FBBF24',           // Amber
  'Living/Utilities': '#3B82F6', // Blue
  'Fun': '#8B5CF6',            // Purple
  'Clothing': '#EC4899',       // Pink
  'Education': '#14B8A6',      // Teal
  'Transportation': '#06B6D4', // Cyan
  'Gift': '#84CC16',           // Lime
  'Personal Care': '#F472B6',  // Soft Pink
  'Travel Vacation': '#0EA5E9',// Sky Blue
  'Income': '#22C55E',         // Vibrant Green
  'Giving': '#6366F1',         // Indigo
  'Other': '#6B7280'           // Neutral Gray
};

const getCategoryColor = (cat) => CATEGORY_COLORS[cat] || '#6B7280';

const getBatteryColor = (level) => {
  if (level <= 10) return 'red';
  if (level <= 25) return 'orange';
  if (level <= 50) return 'yellow';
  if (level <= 75) return 'lime';
  return 'green';
};

const parseGoalCategories = (cat) => {
  if (!cat) return [];
  if (Array.isArray(cat)) return cat.map(c => String(c).trim()).filter(Boolean);
  if (typeof cat === 'string') {
    try {
      const parsed = JSON.parse(cat);
      if (Array.isArray(parsed)) return parsed.map(c => String(c).trim()).filter(Boolean);
    } catch (e) {}
    return cat.split(',').map(c => c.trim()).filter(Boolean);
  }
  return [];
};

const ACCENT_COLOR = "#2DD4BF"; // Aquamarine

const isLivingOrUtilityCategory = (cat) => {
  if (!cat) return false;
  const c = cat.trim().toLowerCase();
  return c === 'living/utilities' || c === 'living/utility' || c.startsWith('living') || c.includes('utility') || c === 'rent';
};

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }) => {
  const isSmall = percent < 0.05;
  const radius = innerRadius + (outerRadius - innerRadius) * (isSmall ? 1.4 : 0.5);
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (isSmall) {
    const lineStartRadius = outerRadius;
    const lineEndRadius = outerRadius * 1.2;
    const lx1 = cx + lineStartRadius * Math.cos(-midAngle * RADIAN);
    const ly1 = cy + lineStartRadius * Math.sin(-midAngle * RADIAN);
    const lx2 = cx + lineEndRadius * Math.cos(-midAngle * RADIAN);
    const ly2 = cy + lineEndRadius * Math.sin(-midAngle * RADIAN);

    const necessityColors = { 1: '#F87171', 2: '#FB923C', 3: '#FACC15', 4: '#4ADE80', 5: '#22C55E' };
    const labelColor = necessityColors[name] || getCategoryColor(name);

    return (
      <g>
        <polyline points={`${lx1},${ly1} ${lx2},${ly2}`} stroke="#666666" strokeWidth={1} fill="none" />
        <text 
          x={x} 
          y={y} 
          fill={labelColor} 
          textAnchor={x > cx ? 'start' : 'end'} 
          dominantBaseline="central" 
          fontSize="11" 
          fontWeight="bold"
        >
          {`${(percent * 100).toFixed(0)}%`}
        </text>
      </g>
    );
  }

  return (
    <text 
      x={x} 
      y={y} 
      fill="#FFFFFF" 
      textAnchor="middle" 
      dominantBaseline="central" 
      fontSize="11" 
      fontWeight="bold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const CustomMonthlyTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const gross = data.GrossIncome || 0;
    const net = data.NetIncome || 0;
    const spend = data.TotalSpending || 0;
    const spendingRatio = net > 0 ? (spend / net) * 100 : 0;

    return (
      <Paper p="sm" withBorder style={{ backgroundColor: '#1A1A1A', borderColor: '#333333' }}>
        <Text size="xs" fw={700} c="dimmed" mb={4}>{label}</Text>
        <Stack gap={2}>
          <Group justify="space-between" gap="lg">
            <Text size="xs" c="green.4">Income:</Text>
            <Text size="xs" fw={600} c="green.4">${gross.toLocaleString(undefined, {minimumFractionDigits: 2})}</Text>
          </Group>
          <Group justify="space-between" gap="lg">
            <Text size="xs" c="red.4">Total Spending:</Text>
            <Text size="xs" fw={600} c="red.4">${spend.toLocaleString(undefined, {minimumFractionDigits: 2})}</Text>
          </Group>
          <Divider my={4} color="#333333" />
          <Group justify="space-between" gap="lg">
            <Text size="xs" fw={700}>Spend / Income Ratio:</Text>
            <Text size="xs" fw={700} c={spendingRatio <= 100 ? "green.4" : "red.4"}>
              {spendingRatio.toFixed(1)}%
            </Text>
          </Group>
        </Stack>
      </Paper>
    );
  }
  return null;
};

export default function App() {
  const [transactions, setTransactions] = useState([])
  const [goals, setGoals] = useState([])
  const [recurrings, setRecurrings] = useState([])
  const [assets, setAssets] = useState([])
  const [savings, setSavings] = useState([])
  const [savingsAccounts, setSavingsAccounts] = useState([])
  const [view, setView] = useState('dashboard') // 'dashboard', 'log', 'trends', 'cashflow', 'goals', 'recurrings', 'assets', 'savings', 'settings', 'info'
  const [categoryChartView, setCategoryChartView] = useState('pie') // 'pie' or 'ranking'
  const [opened, { toggle: toggleForm }] = useDisclosure(false)
  const [mobileOpened, { toggle: toggleMobile, close: closeMobile }] = useDisclosure(false)
  const [filtersOpened, { toggle: toggleFilters, close: closeFilters }] = useDisclosure(false)
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [necessitySort, setNecessitySort] = useState({ key: 'count', direction: 'desc' });
  const [editingId, setEditingId] = useState(null);
  const [selectedUser, setSelectedUser] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [demoNotice, setDemoNotice] = useState(null);

  // Standalone offline mode flag
  const [isStandalone, setIsStandalone] = useState(
    window.location.hostname === 'budgetstar.serpilas.com' ||
    import.meta.env.VITE_STANDALONE === 'true'
  );

  // Application Settings
  const [settings, setSettings] = useState(() => {
    const defaultSettings = {
      users: [
        { name: 'User 1', color: 'cyan' },
        { name: 'User 2', color: 'pink' }
      ],
      tithingEnabled: false,
      tithingPercent: 10,
      savingsEnabled: true,
      manualIncome: '3500',
      paymentMethods: ['Credit Card', 'Debit Card', 'Cash', 'Bank Transfer', 'Mobile Pay', 'Online Service'],
      customCategories: ['Groceries', 'Eat out', 'Fuel', 'Living/Utilities', 'Subscription', 'Fun', 'Clothing', 'Education', 'Transportation', 'Gift', 'Personal Care', 'Travel Vacation', 'Income', 'Giving', 'Other']
    };
    try {
      const saved = localStorage.getItem('budgetstar_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure users array exists
        if (!parsed.users || !Array.isArray(parsed.users) || parsed.users.length === 0) {
          parsed.users = defaultSettings.users;
        }
        if (!parsed.customCategories || !Array.isArray(parsed.customCategories) || parsed.customCategories.length === 0) {
          parsed.customCategories = defaultSettings.customCategories;
        }
        return { ...defaultSettings, ...parsed };
      }
    } catch (e) {
      console.error("Failed to load settings:", e);
    }
    return defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem('budgetstar_settings', JSON.stringify(settings));
  }, [settings]);

  // User Cycling Helper
  const cycleUser = () => {
    const userNames = settings.users.map(u => u.name);
    const cycleList = ['All', ...userNames];
    setSelectedUser(prev => {
      const currIdx = cycleList.indexOf(prev);
      if (currIdx === -1 || currIdx === cycleList.length - 1) return cycleList[0];
      return cycleList[currIdx + 1];
    });
  };

  const getUserColor = (userName) => {
    if (!userName || userName === 'All' || userName === 'Shared' || userName === 'Both') return 'teal';
    const found = settings.users.find(u => u.name.toLowerCase() === userName.toLowerCase());
    return found?.color || 'cyan';
  };

  const getTitleColor = () => {
    if (selectedUser === 'All') return '#A0AEC0';
    const color = getUserColor(selectedUser);
    const colorMap = {
      cyan: '#22D3EE',
      pink: '#F472B6',
      blue: '#38BDF8',
      purple: '#A855F7',
      green: '#4ADE80',
      orange: '#FB923C',
      yellow: '#FACC15',
      teal: '#2DD4BF'
    };
    return colorMap[color] || '#2DD4BF';
  };

  // Local storage helpers
  const getLocalData = (key, fallback = []) => {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch (e) {
      console.error(`Error loading local storage key ${key}:`, e);
      return fallback;
    }
  };

  const setLocalData = (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error(`Error saving local storage key ${key}:`, e);
    }
  };

  const performSave = async (apiEndpoint, localStorageKey, payload, id = null, isUpdate = false) => {
    if (isStandalone) {
      const items = getLocalData(localStorageKey);
      if (isUpdate && id !== null) {
        const index = items.findIndex(item => item.id === id);
        if (index !== -1) {
          items[index] = { ...items[index], ...payload, id };
        }
      } else {
        const newItem = { ...payload, id: Date.now() + Math.floor(Math.random() * 1000) };
        items.unshift(newItem);
      }
      setLocalData(localStorageKey, items);
      return { data: items };
    } else {
      const baseUrl = import.meta.env.BASE_URL.replace(/\/$/, '');
      if (isUpdate && id !== null) {
        return await axios.put(`${baseUrl}/api/${apiEndpoint}/${id}`, payload);
      } else {
        return await axios.post(`${baseUrl}/api/${apiEndpoint}/`, payload);
      }
    }
  };

  const performDelete = async (apiEndpoint, localStorageKey, id) => {
    if (isStandalone) {
      const items = getLocalData(localStorageKey);
      const filtered = items.filter(item => item.id !== id);
      setLocalData(localStorageKey, filtered);
      return { data: filtered };
    } else {
      const baseUrl = import.meta.env.BASE_URL.replace(/\/$/, '');
      return await axios.delete(`${baseUrl}/api/${apiEndpoint}/${id}`);
    }
  };

  // Asset Form state
  const [assetForm, setAssetForm] = useState({
    name: '',
    purchase_date: new Date(),
    purchase_price: '',
    estimated_value: '',
    description: '',
    user: 'User 1',
    updated_at: new Date()
  });
  const [editingAsset, setEditingAsset] = useState(null);

  // Scenario planner state (for giving/tithing mode)
  const [plannerGrossIncome, setPlannerGrossIncome] = useState('');
  const [plannerTithing, setPlannerTithing] = useState('');

  // Filters state
  const [period, setPeriod] = useState('All Time');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedMethods, setSelectedMethods] = useState([]);

  const PERIOD_OPTIONS = [
    'All Time', 
    'Custom Range',
    'This Month', 'Last Month',
    'Last 1 Month', 'Last 3 Months', 'Last 6 Months', 'Last 12 Months',
    'This Quarter', 'Last Quarter',
    'This Year'
  ];

  const getFilteredTransactions = (baseTransactions, periodStr, arg1 = null, arg2 = null) => {
    const now = dayjs();
    let start, end;
    if (periodStr === 'All Time') return baseTransactions;

    if (periodStr === 'Custom Range' && arg1) {
      start = dayjs(arg1).startOf('day');
      if (arg2) end = dayjs(arg2).endOf('day');
    }
    else if (periodStr === 'Last 1 Month') start = now.subtract(1, 'month').startOf('month');
    else if (periodStr === 'Last 3 Months') start = now.subtract(3, 'month').startOf('month');
    else if (periodStr === 'Last 6 Months') start = now.subtract(6, 'month').startOf('month');
    else if (periodStr === 'Last 12 Months') start = now.subtract(12, 'month').startOf('month');
    else if (periodStr === 'This Month') start = now.startOf('month');
    else if (periodStr === 'Last Month') {
      start = now.subtract(1, 'month').startOf('month');
      end = now.subtract(1, 'month').endOf('month');
    }
    else if (periodStr === 'This Quarter') start = now.startOf('quarter');
    else if (periodStr === 'Last Quarter') {
      start = now.subtract(1, 'quarter').startOf('quarter');
      end = now.subtract(1, 'quarter').endOf('quarter');
    }
    else if (periodStr === 'This Year') start = now.startOf('year');
    
    if (start) {
      return baseTransactions.filter(t => {
        const d = dayjs(t.date);
        if (end) return (d.isAfter(start) || d.isSame(start)) && (d.isBefore(end) || d.isSame(end));
        return d.isAfter(start) || d.isSame(start);
      });
    }
    return baseTransactions;
  };

  // Transaction Form state
  const [form, setForm] = useState({
    date: new Date(),
    description: '',
    amount: '',
    necessity: 3,
    method: 'Credit Card',
    category: 'Groceries',
    user: 'User 1',
    tag: '',
    notes: '',
    is_reimbursed: false,
    reimbursement_amount: ''
  });

  // Goal Form state
  const [goalForm, setGoalForm] = useState({
    categories: ['Groceries'],
    amount: 100,
    period: 'month',
    user: 'Shared'
  });
  const [editingGoal, setEditingGoal] = useState(null);

  // Recurring Form state
  const [recurringForm, setRecurringForm] = useState({
    name: '',
    category: 'Subscription',
    amount: 10,
    period: 'month',
    notes: '',
    day: '1st'
  });
  const [editingRecurring, setEditingRecurring] = useState(null);

  // Savings form state
  const [newAccountName, setNewAccountName] = useState('');
  const [savingForm, setSavingForm] = useState({
    date: new Date(),
    amount: '',
    notes: '',
    account_name: 'Emergency Fund'
  });
  const [editingSaving, setEditingSaving] = useState(null);

  useEffect(() => {
    fetchTransactions();
    fetchGoals();
    fetchRecurrings();
    fetchAssets();
    fetchSavings();
    fetchSavingsAccounts();
  }, []);

  const fetchTransactions = async () => {
    if (isStandalone) {
      const data = getLocalData('budgetstar_transactions');
      setTransactions(data);
      initializeFilters(data);
      return;
    }
    try {
      const baseUrl = import.meta.env.BASE_URL.replace(/\/$/, '');
      const response = await axios.get(`${baseUrl}/api/transactions/?limit=10000`);
      setTransactions(response.data);
      setLocalData('budgetstar_transactions', response.data);
      initializeFilters(response.data);
    } catch (error) {
      console.warn("Backend error fetching transactions, falling back to local storage:", error);
      setIsStandalone(true);
      const data = getLocalData('budgetstar_transactions');
      setTransactions(data);
      initializeFilters(data);
    }
  };

  const initializeFilters = (data) => {
    if (selectedCategories.length === 0) {
      const dbCats = data.map(t => t.category);
      const staticCats = Object.keys(CATEGORY_COLORS);
      const cats = [...new Set([...dbCats, ...staticCats])].filter(Boolean);
      setSelectedCategories(cats);
    }
    if (selectedMethods.length === 0) {
      const rawMethods = [
        ...data.map(t => t.method),
        ...(settings.paymentMethods || [])
      ].filter(Boolean);
      const methods = [...new Set(rawMethods)].sort();
      setSelectedMethods(methods);
    }
  };

  const getGoalUserOrder = (user) => {
    const u = (user || 'Shared').toLowerCase().trim();
    if (u === 'shared' || u === 'both' || u === 'all') return 0;
    const userNames = settings.users.map(x => x.name.toLowerCase());
    const idx = userNames.indexOf(u);
    return idx >= 0 ? idx + 1 : 99;
  };

  const sortGoalsByPerson = (goalList = []) => {
    const list = Array.isArray(goalList) ? goalList : [];
    return [...list].sort((a, b) => {
      const orderA = getGoalUserOrder(a.user);
      const orderB = getGoalUserOrder(b.user);
      if (orderA !== orderB) return orderA - orderB;
      return (a.id || 0) - (b.id || 0);
    });
  };

  const fetchGoals = async () => {
    if (isStandalone) {
      setGoals(sortGoalsByPerson(getLocalData('budgetstar_goals')));
      return;
    }
    try {
      const baseUrl = import.meta.env.BASE_URL.replace(/\/$/, '');
      const response = await axios.get(`${baseUrl}/api/goals/`);
      setGoals(sortGoalsByPerson(response.data));
      setLocalData('budgetstar_goals', response.data);
    } catch (error) {
      console.warn("Backend error fetching goals, falling back to local storage:", error);
      setIsStandalone(true);
      setGoals(sortGoalsByPerson(getLocalData('budgetstar_goals')));
    }
  };

  const fetchRecurrings = async () => {
    if (isStandalone) {
      setRecurrings(getLocalData('budgetstar_recurrings'));
      return;
    }
    try {
      const baseUrl = import.meta.env.BASE_URL.replace(/\/$/, '');
      const response = await axios.get(`${baseUrl}/api/recurrings/`);
      setRecurrings(response.data);
      setLocalData('budgetstar_recurrings', response.data);
    } catch (error) {
      console.warn("Backend error fetching recurrings, falling back to local storage:", error);
      setIsStandalone(true);
      setRecurrings(getLocalData('budgetstar_recurrings'));
    }
  };

  const fetchAssets = async () => {
    if (isStandalone) {
      setAssets(getLocalData('budgetstar_assets'));
      return;
    }
    try {
      const baseUrl = import.meta.env.BASE_URL.replace(/\/$/, '');
      const response = await axios.get(`${baseUrl}/api/assets/`);
      setAssets(response.data);
      setLocalData('budgetstar_assets', response.data);
    } catch (error) {
      console.warn("Backend error fetching assets, falling back to local storage:", error);
      setIsStandalone(true);
      setAssets(getLocalData('budgetstar_assets'));
    }
  };

  const fetchSavings = async () => {
    if (isStandalone) {
      setSavings(getLocalData('budgetstar_savings'));
      return;
    }
    try {
      const baseUrl = import.meta.env.BASE_URL.replace(/\/$/, '');
      const response = await axios.get(`${baseUrl}/api/savings/`);
      setSavings(response.data);
      setLocalData('budgetstar_savings', response.data);
    } catch (error) {
      console.warn("Backend error fetching savings:", error);
      setSavings(getLocalData('budgetstar_savings'));
    }
  };

  const fetchSavingsAccounts = async () => {
    if (isStandalone) {
      const accs = getLocalData('budgetstar_savings_accounts', [
        { id: 1, name: 'Emergency Fund', user: 'User 1' },
        { id: 2, name: 'Checking Account', user: 'User 1' },
        { id: 3, name: 'High-Yield Savings', user: 'User 1' }
      ]);
      setSavingsAccounts(accs);
      return;
    }
    try {
      const baseUrl = import.meta.env.BASE_URL.replace(/\/$/, '');
      const response = await axios.get(`${baseUrl}/api/savings-accounts/`);
      setSavingsAccounts(response.data);
      setLocalData('budgetstar_savings_accounts', response.data);
    } catch (error) {
      console.warn("Backend error fetching savings accounts:", error);
      const accs = getLocalData('budgetstar_savings_accounts', [
        { id: 1, name: 'Emergency Fund', user: 'User 1' },
        { id: 2, name: 'Checking Account', user: 'User 1' },
        { id: 3, name: 'High-Yield Savings', user: 'User 1' }
      ]);
      setSavingsAccounts(accs);
    }
  };

  // Transaction CRUD Handlers
  const handleSubmit = async () => {
    if (!form.description || form.amount === '' || isNaN(form.amount)) return;
    try {
      const payload = {
        date: dayjs(form.date).format('YYYY-MM-DD'),
        description: form.description.trim(),
        amount: parseFloat(form.amount),
        necessity: parseInt(form.necessity),
        method: form.method,
        category: form.category,
        user: form.user || settings.users[0]?.name || 'User 1',
        tag: form.tag || null,
        notes: form.notes || null,
        is_reimbursed: Boolean(form.is_reimbursed),
        reimbursement_amount: form.is_reimbursed ? (parseFloat(form.reimbursement_amount) || 0) : 0
      };

      await performSave('transactions', 'budgetstar_transactions', payload, editingId, !!editingId);

      setForm({
        date: new Date(),
        description: '',
        amount: '',
        necessity: 3,
        method: settings.paymentMethods[0] || 'Credit Card',
        category: 'Groceries',
        user: selectedUser !== 'All' ? selectedUser : (settings.users[0]?.name || 'User 1'),
        tag: '',
        notes: '',
        is_reimbursed: false,
        reimbursement_amount: ''
      });
      setEditingId(null);
      if (opened) toggleForm();
      fetchTransactions();
    } catch (error) {
      console.error("Error saving transaction:", error);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this transaction record?')) {
      try {
        await performDelete('transactions', 'budgetstar_transactions', id);
        fetchTransactions();
      } catch (error) {
        console.error("Error deleting transaction:", error);
      }
    }
  };

  // Goal CRUD Handlers
  const handleGoalSubmit = async () => {
    if (goalForm.categories.length === 0 || !goalForm.amount) return;
    try {
      const payload = {
        category: goalForm.categories.join(', '),
        amount: parseFloat(goalForm.amount),
        period: goalForm.period,
        user: goalForm.user || 'Shared'
      };

      await performSave('goals', 'budgetstar_goals', payload, editingGoal?.id, !!editingGoal);

      setGoalForm({
        categories: ['Groceries'],
        amount: 100,
        period: 'month',
        user: 'Shared'
      });
      setEditingGoal(null);
      fetchGoals();
    } catch (error) {
      console.error("Error saving goal:", error);
    }
  };

  const handleDeleteGoal = async (id) => {
    if (confirm('Delete this budget goal?')) {
      try {
        await performDelete('goals', 'budgetstar_goals', id);
        fetchGoals();
      } catch (error) {
        console.error("Error deleting goal:", error);
      }
    }
  };

  // Recurring CRUD Handlers
  const handleRecurringSubmit = async () => {
    if (!recurringForm.name || !recurringForm.amount) return;
    try {
      const payload = {
        name: recurringForm.name.trim(),
        amount: parseFloat(recurringForm.amount),
        category: recurringForm.category,
        period: recurringForm.period,
        notes: recurringForm.notes || null,
        day: recurringForm.day || null
      };

      await performSave('recurrings', 'budgetstar_recurrings', payload, editingRecurring?.id, !!editingRecurring);

      setRecurringForm({
        name: '',
        category: 'Subscription',
        amount: 10,
        period: 'month',
        notes: '',
        day: '1st'
      });
      setEditingRecurring(null);
      fetchRecurrings();
    } catch (error) {
      console.error("Error saving recurring subscription:", error);
    }
  };

  const handleDeleteRecurring = async (id) => {
    if (confirm('Delete this recurring expense?')) {
      try {
        await performDelete('recurrings', 'budgetstar_recurrings', id);
        fetchRecurrings();
      } catch (error) {
        console.error("Error deleting recurring subscription:", error);
      }
    }
  };

  // Asset CRUD Handlers
  const handleAssetSubmit = async () => {
    if (!assetForm.name) return;
    try {
      const payload = {
        name: assetForm.name.trim(),
        purchase_date: dayjs(assetForm.purchase_date).format('YYYY-MM-DD'),
        updated_at: dayjs(assetForm.updated_at).format('YYYY-MM-DD'),
        purchase_price: parseFloat(assetForm.purchase_price) || 0,
        estimated_value: parseFloat(assetForm.estimated_value) || 0,
        description: assetForm.description || '',
        user: assetForm.user || settings.users[0]?.name || 'User 1'
      };

      await performSave('assets', 'budgetstar_assets', payload, editingAsset?.id, !!editingAsset);

      setAssetForm({
        name: '',
        purchase_date: new Date(),
        purchase_price: '',
        estimated_value: '',
        description: '',
        user: 'User 1',
        updated_at: new Date()
      });
      setEditingAsset(null);
      fetchAssets();
    } catch (error) {
      console.error("Error saving asset:", error);
    }
  };

  const handleDeleteAsset = async (id) => {
    if (confirm('Delete this asset entry?')) {
      try {
        await performDelete('assets', 'budgetstar_assets', id);
        fetchAssets();
      } catch (error) {
        console.error("Error deleting asset:", error);
      }
    }
  };

  // Savings CRUD Handlers
  const handleSavingSubmit = async () => {
    if (!savingForm.amount) return;
    try {
      const payload = {
        date: dayjs(savingForm.date).format('YYYY-MM-DD'),
        amount: parseFloat(savingForm.amount),
        notes: savingForm.notes || '',
        account_name: savingForm.account_name || 'Emergency Fund',
        user: selectedUser !== 'All' ? selectedUser : (settings.users[0]?.name || 'User 1')
      };

      await performSave('savings', 'budgetstar_savings', payload, editingSaving?.id, !!editingSaving);

      setSavingForm({
        date: new Date(),
        amount: '',
        notes: '',
        account_name: savingsAccounts[0]?.name || 'Emergency Fund'
      });
      setEditingSaving(null);
      fetchSavings();
    } catch (error) {
      console.error("Error saving record:", error);
    }
  };

  const handleDeleteSaving = async (id) => {
    if (confirm('Delete this savings balance log?')) {
      try {
        await performDelete('savings', 'budgetstar_savings', id);
        fetchSavings();
      } catch (error) {
        console.error("Error deleting savings record:", error);
      }
    }
  };

  // Demo Seed & Reset Handlers
  const handleSeedDemoData = async () => {
    try {
      if (!isStandalone) {
        const baseUrl = import.meta.env.BASE_URL.replace(/\/$/, '');
        await axios.post(`${baseUrl}/api/demo/seed`);
      } else {
        // Local seed generator
        const today = dayjs();
        const demoTxs = [];
        const sampleCats = [
          { cat: 'Groceries', desc: 'Weekly supermarket trip', amount: 84.50, nec: 4, meth: 'Credit Card', user: 'User 1' },
          { cat: 'Eat out', desc: 'Lunch bistro & coffee', amount: 16.50, nec: 2, meth: 'Debit Card', user: 'User 2' },
          { cat: 'Fuel', desc: 'Gasoline refill', amount: 42.00, nec: 4, meth: 'Credit Card', user: 'User 1' },
          { cat: 'Living/Utilities', desc: 'Apartment monthly rent', amount: 1200.00, nec: 5, meth: 'Bank Transfer', user: 'Shared' },
          { cat: 'Subscription', desc: 'Cloud storage backup', amount: 9.99, nec: 3, meth: 'Credit Card', user: 'Shared' },
          { cat: 'Income', desc: 'Bi-weekly paycheck deposit', amount: 1850.00, nec: 5, meth: 'Bank Transfer', user: 'User 1' },
          { cat: 'Personal Care', desc: 'Pharmacy essentials', amount: 22.40, nec: 3, meth: 'Debit Card', user: 'User 2' }
        ];

        for (let i = 0; i < 40; i++) {
          const item = sampleCats[i % sampleCats.length];
          const txDate = today.subtract(Math.floor(i * 1.8), 'day').format('YYYY-MM-DD');
          demoTxs.push({
            id: Date.now() + i,
            date: txDate,
            description: item.desc,
            amount: +(item.amount * (0.9 + Math.random() * 0.25)).toFixed(2),
            necessity: item.nec,
            method: item.meth,
            category: item.cat,
            user: item.user,
            notes: 'Sample demonstration record'
          });
        }
        setLocalData('budgetstar_transactions', demoTxs);
      }
      setDemoNotice("Sample demo data populated successfully!");
      fetchTransactions();
      fetchGoals();
      fetchRecurrings();
      fetchAssets();
      setTimeout(() => setDemoNotice(null), 4000);
    } catch (e) {
      console.error("Error seeding demo data:", e);
    }
  };

  const handleResetData = async () => {
    if (confirm("Reset and clear all transactions, goals, and assets? This cannot be undone.")) {
      try {
        if (!isStandalone) {
          const baseUrl = import.meta.env.BASE_URL.replace(/\/$/, '');
          await axios.post(`${baseUrl}/api/demo/reset`);
        } else {
          localStorage.removeItem('budgetstar_transactions');
          localStorage.removeItem('budgetstar_goals');
          localStorage.removeItem('budgetstar_recurrings');
          localStorage.removeItem('budgetstar_assets');
          localStorage.removeItem('budgetstar_savings');
        }
        fetchTransactions();
        fetchGoals();
        fetchRecurrings();
        fetchAssets();
        fetchSavings();
        setDemoNotice("All transaction and budget data has been cleared.");
        setTimeout(() => setDemoNotice(null), 4000);
      } catch (e) {
        console.error("Error resetting data:", e);
      }
    }
  };

  // CSV Export & Import Handlers
  const handleExportCSV = () => {
    if (transactions.length === 0) return alert("No transactions to export.");
    const headers = ["Date", "Description", "Amount", "Category", "Method", "User", "Necessity", "Notes", "Reimbursed", "ReimbursementAmount"];
    const rows = transactions.map(t => [
      t.date,
      `"${(t.description || '').replace(/"/g, '""')}"`,
      t.amount,
      t.category,
      t.method,
      t.user || 'User 1',
      t.necessity,
      `"${(t.notes || '').replace(/"/g, '""')}"`,
      t.is_reimbursed ? 1 : 0,
      t.reimbursement_amount || 0
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `budgetstar_transactions_${dayjs().format('YYYY-MM-DD')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target.result;
        const lines = text.split('\n').filter(l => l.trim().length > 0);
        if (lines.length <= 1) return alert("CSV file appears to be empty.");
        let imported = 0;
        for (let i = 1; i < lines.length; i++) {
          const parts = lines[i].split(',').map(s => s.trim().replace(/^"|"$/g, ''));
          if (parts.length >= 3 && parts[0] && parts[1] && !isNaN(parts[2])) {
            const payload = {
              date: parts[0],
              description: parts[1],
              amount: parseFloat(parts[2]) || 0,
              category: parts[3] || 'Miscellaneous',
              method: parts[4] || 'Credit Card',
              user: parts[5] || 'User 1',
              necessity: parseInt(parts[6]) || 3,
              notes: parts[7] || null,
              is_reimbursed: parts[8] === '1' || parts[8] === 'true',
              reimbursement_amount: parseFloat(parts[9]) || 0
            };
            await performSave('transactions', 'budgetstar_transactions', payload);
            imported++;
          }
        }
        alert(`Successfully imported ${imported} transactions!`);
        fetchTransactions();
      } catch (err) {
        console.error("CSV import error:", err);
        alert("Failed to parse CSV file.");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Full Backup & Restore Handlers (JSON: Configurations + Database Records)
  const handleExportJSON = () => {
    const backupData = {
      version: '2.0.0',
      application: 'BudgetStar',
      exported_at: new Date().toISOString(),
      settings: settings,
      transactions: transactions,
      goals: goals,
      recurrings: recurrings,
      assets: assets,
      savings: savings,
      savingsAccounts: savingsAccounts
    };
    const jsonString = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute("download", `budgetstar_complete_backup_${dayjs().format('YYYY-MM-DD')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJSON = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (!data || typeof data !== 'object') {
          return alert("Invalid JSON backup file format.");
        }

        // 1. Restore Configurations & Settings
        if (data.settings && typeof data.settings === 'object') {
          const newSettings = { ...settings, ...data.settings };
          setSettings(newSettings);
          setLocalData('budgetstar_settings', newSettings);
        }

        // 2. Restore Transactions
        if (Array.isArray(data.transactions)) {
          setTransactions(data.transactions);
          setLocalData('budgetstar_transactions', data.transactions);
          initializeFilters(data.transactions);
        }

        // 3. Restore Goals
        if (Array.isArray(data.goals)) {
          setGoals(sortGoalsByPerson(data.goals));
          setLocalData('budgetstar_goals', data.goals);
        }

        // 4. Restore Subscriptions / Recurrings
        if (Array.isArray(data.recurrings)) {
          setRecurrings(data.recurrings);
          setLocalData('budgetstar_recurrings', data.recurrings);
        }

        // 5. Restore Assets
        if (Array.isArray(data.assets)) {
          setAssets(data.assets);
          setLocalData('budgetstar_assets', data.assets);
        }

        // 6. Restore Savings & Accounts
        if (Array.isArray(data.savings)) {
          setSavings(data.savings);
          setLocalData('budgetstar_savings', data.savings);
        }
        if (Array.isArray(data.savingsAccounts)) {
          setSavingsAccounts(data.savingsAccounts);
          setLocalData('budgetstar_savings_accounts', data.savingsAccounts);
        }

        setDemoNotice("Complete backup restored! User profiles, payment methods, categories, and all transaction records loaded successfully.");
        setTimeout(() => setDemoNotice(null), 5000);
      } catch (err) {
        console.error("JSON import error:", err);
        alert("Failed to parse JSON backup file: " + (err.message || 'Invalid format'));
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleForceUpdate = async () => {
    setIsUpdating(true);
    try {
      if ('caches' in window) {
        const cacheKeys = await caches.keys();
        await Promise.all(cacheKeys.map(key => caches.delete(key)));
      }
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map(reg => reg.unregister()));
      }
      const timestamp = Date.now();
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set('_cache_bust', timestamp.toString());
      try {
        await fetch(currentUrl.toString(), {
          cache: 'reload',
          headers: {
            'Pragma': 'no-cache',
            'Cache-Control': 'no-cache, no-store, must-revalidate'
          }
        });
      } catch (e) {}
      window.location.replace(currentUrl.toString());
    } catch (err) {
      console.error('Error bypassing cache:', err);
      window.location.reload();
    }
  };

  // Filtered transactions for active view
  const filteredTransactions = useMemo(() => {
    let result = getFilteredTransactions(transactions, period, startDate, endDate);

    if (selectedUser && selectedUser !== 'All') {
      result = result.filter(t => (t.user || settings.users[0]?.name || 'User 1').toLowerCase() === selectedUser.toLowerCase());
    }

    if (selectedCategories.length > 0) {
      result = result.filter(t => selectedCategories.includes(t.category));
    }

    if (selectedMethods.length > 0) {
      result = result.filter(t => selectedMethods.includes(t.method));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(t => {
        return (
          (t.description || '').toLowerCase().includes(q) ||
          (t.category || '').toLowerCase().includes(q) ||
          (t.method || '').toLowerCase().includes(q) ||
          (t.user || '').toLowerCase().includes(q) ||
          (t.notes || '').toLowerCase().includes(q) ||
          (t.date || '').includes(q) ||
          String(t.amount || '').includes(q)
        );
      });
    }

    return result;
  }, [transactions, period, startDate, endDate, selectedUser, selectedCategories, selectedMethods, searchQuery, settings.users]);

  // Statistical calculations (Top 5 overview cards)
  const stats = useMemo(() => {
    // Exclude category = 'Income' from expense statistics
    const nonIncomeTxns = filteredTransactions.filter(t => (t.category || '').toLowerCase() !== 'income');
    const total = nonIncomeTxns.reduce((acc, t) => acc + (t.amount - (t.reimbursement_amount || 0)), 0);
    const count = nonIncomeTxns.length;
    const avg = count > 0 ? total / count : 0;

    const monthsSet = new Set(nonIncomeTxns.map(t => dayjs(t.date).format('YYYY-MM')));
    const numMonths = Math.max(1, monthsSet.size);
    const monthlyAvg = total / numMonths;

    // Current month calculations
    const now = dayjs();
    const currentMonthStr = now.format('YYYY-MM');
    const dayOfMonth = now.date();
    const daysInMonth = now.daysInMonth();

    const currentMonthTxns = transactions.filter(t => {
      if ((t.category || '').toLowerCase() === 'income') return false;
      const inMonth = dayjs(t.date).format('YYYY-MM') === currentMonthStr;
      if (!inMonth) return false;
      if (selectedUser && selectedUser !== 'All') {
        return (t.user || settings.users[0]?.name || 'User 1').toLowerCase() === selectedUser.toLowerCase();
      }
      return true;
    });

    const spentThisMonth = currentMonthTxns.reduce((acc, t) => acc + (t.amount - (t.reimbursement_amount || 0)), 0);

    // Variable spending (excluding fixed Living/Utilities)
    const paceSpentThisMonth = currentMonthTxns
      .filter(t => !isLivingOrUtilityCategory(t.category))
      .reduce((acc, t) => acc + (t.amount - (t.reimbursement_amount || 0)), 0);

    // 3-Month Variable Baseline
    const pastMonths = [1, 2, 3].map(m => now.subtract(m, 'month').format('YYYY-MM'));
    const pastMonthsVariableSpend = pastMonths.map(mStr => {
      return transactions
        .filter(t => {
          if ((t.category || '').toLowerCase() === 'income') return false;
          if (dayjs(t.date).format('YYYY-MM') !== mStr) return false;
          if (isLivingOrUtilityCategory(t.category)) return false;
          if (selectedUser && selectedUser !== 'All') {
            return (t.user || settings.users[0]?.name || 'User 1').toLowerCase() === selectedUser.toLowerCase();
          }
          return true;
        })
        .reduce((acc, t) => acc + (t.amount - (t.reimbursement_amount || 0)), 0);
    });

    const activeMonths = pastMonthsVariableSpend.filter(amt => amt > 0);
    const past3MonthsAvg = activeMonths.length > 0 
      ? activeMonths.reduce((a, b) => a + b, 0) / activeMonths.length 
      : (paceSpentThisMonth || 500);

    const expectedSpendToDate = (past3MonthsAvg / daysInMonth) * dayOfMonth;
    const pacePercent = expectedSpendToDate > 0 ? (paceSpentThisMonth / expectedSpendToDate) * 100 : 0;

    const remainingDays = Math.max(1, daysInMonth - dayOfMonth + 1);
    const dailyTarget = past3MonthsAvg / daysInMonth;
    const actualDailyAvg = paceSpentThisMonth / Math.max(1, dayOfMonth);
    const maxDailyRemaining = Math.max(0, (past3MonthsAvg - paceSpentThisMonth) / remainingDays);

    return {
      total,
      count,
      avg,
      monthlyAvg,
      spentThisMonth,
      paceSpentThisMonth,
      pacePercent,
      past3MonthsAvg,
      dailyTarget,
      actualDailyAvg,
      maxDailyRemaining
    };
  }, [filteredTransactions, transactions, selectedUser, settings.users]);

  // Income & Cashflow Stats
  const incomeStats = useMemo(() => {
    let filteredForIncome = getFilteredTransactions(transactions, period, startDate, endDate);
    if (selectedUser && selectedUser !== 'All') {
      filteredForIncome = filteredForIncome.filter(t => (t.user || settings.users[0]?.name || 'User 1').toLowerCase() === selectedUser.toLowerCase());
    }

    const tithingPaid = settings.tithingEnabled
      ? filteredForIncome
        .filter(t => t.category && (t.category.toLowerCase() === 'tithing' || t.category.toLowerCase() === 'giving'))
        .reduce((acc, t) => acc + t.amount, 0)
      : 0;

    let grossIncome, netIncome;
    if (settings.tithingEnabled) {
      grossIncome = tithingPaid * 10;
      netIncome = tithingPaid * 9;
    } else {
      // Calculate income directly from logged Income transactions
      const loggedIncome = filteredForIncome
        .filter(t => t.category && t.category.toLowerCase() === 'income')
        .reduce((acc, t) => acc + t.amount, 0);

      const monthsSet = new Set(filteredForIncome.map(t => dayjs(t.date).format('YYYY-MM')));
      const numMonths = Math.max(1, monthsSet.size);

      grossIncome = loggedIncome > 0 ? loggedIncome : (parseFloat(settings.manualIncome) || 0) * numMonths;
      netIncome = grossIncome;
    }

    const totalSpent = filteredForIncome
      .filter(t => !t.category || t.category.toLowerCase() !== 'income')
      .reduce((acc, t) => acc + (t.amount - (t.reimbursement_amount || 0)), 0);

    const livingSpent = settings.tithingEnabled
      ? filteredForIncome
        .filter(t => !t.category || (t.category.toLowerCase() !== 'tithing' && t.category.toLowerCase() !== 'giving' && t.category.toLowerCase() !== 'income'))
        .reduce((acc, t) => acc + (t.amount - (t.reimbursement_amount || 0)), 0)
      : totalSpent;

    const netSavings = netIncome - livingSpent;
    const savingsRate = netIncome > 0 ? (netSavings / netIncome) * 100 : 0;

    return {
      tithingPaid,
      grossIncome,
      netIncome,
      totalSpent,
      livingSpent,
      netSavings,
      savingsRate
    };
  }, [transactions, period, startDate, endDate, selectedUser, settings.tithingEnabled, settings.manualIncome, settings.users]);

  // Monthly Cash Flow Chart Data
  const monthlyIncomeSpendingData = useMemo(() => {
    const months = {};
    let filtered = getFilteredTransactions(transactions, period, startDate, endDate);
    if (selectedUser && selectedUser !== 'All') {
      filtered = filtered.filter(t => (t.user || settings.users[0]?.name || 'User 1').toLowerCase() === selectedUser.toLowerCase());
    }

    filtered.forEach(t => {
      const month = dayjs(t.date).format('YYYY-MM');
      if (!months[month]) {
        months[month] = { name: month, Income: 0, TotalSpending: 0, Giving: 0 };
      }
      const catLower = (t.category || '').toLowerCase();
      if (catLower === 'income') {
        months[month].Income += t.amount;
      } else if (catLower === 'tithing' || catLower === 'giving') {
        months[month].Giving += t.amount;
        months[month].TotalSpending += t.amount;
      } else {
        months[month].TotalSpending += (t.amount - (t.reimbursement_amount || 0));
      }
    });

    return Object.values(months).map(m => {
      let gross = m.Income;
      if (settings.tithingEnabled && m.Giving > 0) {
        gross = m.Giving * 10;
      } else if (gross === 0) {
        gross = parseFloat(settings.manualIncome) || 0;
      }
      return {
        ...m,
        GrossIncome: gross,
        NetIncome: settings.tithingEnabled ? m.Giving * 9 : gross
      };
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [transactions, period, startDate, endDate, selectedUser, settings.tithingEnabled, settings.manualIncome, settings.users]);

  // Category Pie & Ranking Data
  const chartData = useMemo(() => {
    const categoryTotals = {};
    filteredTransactions.forEach(t => {
      if ((t.category || '').toLowerCase() === 'income') return;
      const cat = t.category || 'Other';
      const effectiveAmt = t.amount - (t.reimbursement_amount || 0);
      categoryTotals[cat] = (categoryTotals[cat] || 0) + effectiveAmt;
    });

    const pieData = Object.entries(categoryTotals).map(([name, value]) => ({
      name,
      value: Math.max(0, value)
    })).filter(d => d.value > 0);

    return { pieData };
  }, [filteredTransactions]);

  const rankingData = useMemo(() => {
    const total = chartData.pieData.reduce((acc, curr) => acc + curr.value, 0);
    return [...chartData.pieData]
      .sort((a, b) => b.value - a.value)
      .map(item => ({
        ...item,
        amount: item.value,
        value: total > 0 ? (item.value / total) * 100 : 0
      }));
  }, [chartData]);

  // Necessity Matrix & Distribution Data
  const necessityData = useMemo(() => {
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    filteredTransactions.forEach(t => {
      if ((t.category || '').toLowerCase() === 'income') return;
      const n = t.necessity || 3;
      counts[n] = (counts[n] || 0) + 1;
    });

    const distData = Object.entries(counts).map(([name, value]) => ({
      name: parseInt(name),
      value
    })).filter(d => d.value > 0);

    return { distData };
  }, [filteredTransactions]);

  // Category Necessity Spreadsheet Data
  const necessityRows = useMemo(() => {
    const catMap = {};
    filteredTransactions.forEach(t => {
      if ((t.category || '').toLowerCase() === 'income') return;
      const cat = t.category || 'Other';
      if (!catMap[cat]) {
        catMap[cat] = {
          category: cat,
          star1: 0,
          star2: 0,
          star3: 0,
          star4: 0,
          star5: 0,
          count: 0,
          totalAmount: 0,
          starSum: 0
        };
      }
      const n = t.necessity || 3;
      if (n === 1) catMap[cat].star1++;
      else if (n === 2) catMap[cat].star2++;
      else if (n === 3) catMap[cat].star3++;
      else if (n === 4) catMap[cat].star4++;
      else if (n === 5) catMap[cat].star5++;

      catMap[cat].count++;
      catMap[cat].starSum += n;
      catMap[cat].totalAmount += (t.amount - (t.reimbursement_amount || 0));
    });

    return Object.values(catMap).map(row => ({
      ...row,
      avg: row.count > 0 ? row.starSum / row.count : 0,
      avgAmount: row.count > 0 ? row.totalAmount / row.count : 0
    }));
  }, [filteredTransactions]);

  const sortedNecessityRows = useMemo(() => {
    return [...necessityRows].sort((a, b) => {
      let aVal = a[necessitySort.key];
      let bVal = b[necessitySort.key];
      if (typeof aVal === 'string') {
        return necessitySort.direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return necessitySort.direction === 'asc' ? (aVal - bVal) : (bVal - aVal);
    });
  }, [necessityRows, necessitySort]);

  const necessityTotals = useMemo(() => {
    const res = { star1: 0, star2: 0, star3: 0, star4: 0, star5: 0, count: 0, totalAmount: 0, starSum: 0 };
    necessityRows.forEach(r => {
      res.star1 += r.star1;
      res.star2 += r.star2;
      res.star3 += r.star3;
      res.star4 += r.star4;
      res.star5 += r.star5;
      res.count += r.count;
      res.totalAmount += r.totalAmount;
      res.starSum += r.starSum;
    });
    return {
      ...res,
      avgStar: res.count > 0 ? res.starSum / res.count : 0,
      avgAmount: res.count > 0 ? res.totalAmount / res.count : 0
    };
  }, [necessityRows]);

  const handleNecessitySort = (key) => {
    setNecessitySort(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  // Reimbursed Transactions list
  const reimbursedTransactions = useMemo(() => {
    return filteredTransactions.filter(t => t.is_reimbursed && t.reimbursement_amount > 0);
  }, [filteredTransactions]);

  // Asset Totals
  const assetTotals = useMemo(() => {
    const totalPurchase = assets.reduce((acc, a) => acc + (a.purchase_price || 0), 0);
    const totalCurrent = assets.reduce((acc, a) => acc + (a.estimated_value || 0), 0);
    const change = totalCurrent - totalPurchase;
    const changePercent = totalPurchase > 0 ? (change / totalPurchase) * 100 : 0;
    return { totalPurchase, totalCurrent, change, changePercent };
  }, [assets]);

  // All available categories and payment methods
  const allCategories = useMemo(() => {
    const list = settings.customCategories || Object.keys(CATEGORY_COLORS);
    const set = new Set([...list, ...transactions.map(t => t.category)].filter(Boolean));
    return Array.from(set);
  }, [settings.customCategories, transactions]);

  const allMethods = useMemo(() => {
    const set = new Set([...settings.paymentMethods, ...transactions.map(t => t.method)].filter(Boolean));
    return Array.from(set);
  }, [settings.paymentMethods, transactions]);

  // Sidebar Filter Component
  const FilterContent = ({ isMobile = false }) => (
    <Stack gap="xs">
      {!isMobile && (
        <>
          <NavLink
            label="Dashboard"
            leftSection={<IconDashboard size="1.1rem" />}
            active={view === 'dashboard'}
            onClick={() => { setView('dashboard'); if (mobileOpened) closeMobile(); }}
            styles={{ label: { fontWeight: 600 } }}
          />
          <NavLink
            label="Averages & Trends"
            leftSection={<IconChartHistogram size="1.1rem" />}
            active={view === 'trends'}
            onClick={() => { setView('trends'); if (mobileOpened) closeMobile(); }}
            styles={{ label: { fontWeight: 600 } }}
          />
          <NavLink
            label="Income & Cashflow"
            leftSection={<IconCoin size="1.1rem" />}
            active={view === 'cashflow'}
            onClick={() => { setView('cashflow'); if (mobileOpened) closeMobile(); }}
            styles={{ label: { fontWeight: 600 } }}
          />
          <NavLink
            label="Purchase Log"
            leftSection={<IconList size="1.1rem" />}
            active={view === 'log'}
            onClick={() => { setView('log'); if (mobileOpened) closeMobile(); }}
            styles={{ label: { fontWeight: 600 } }}
          />
          <NavLink
            label="Budget Goals"
            leftSection={<IconTarget size="1.1rem" />}
            active={view === 'goals'}
            onClick={() => { setView('goals'); if (mobileOpened) closeMobile(); }}
            styles={{ label: { fontWeight: 600 } }}
          />
          <NavLink
            label="Subscriptions"
            leftSection={<IconRepeat size="1.1rem" />}
            active={view === 'recurrings'}
            onClick={() => { setView('recurrings'); if (mobileOpened) closeMobile(); }}
            styles={{ label: { fontWeight: 600 } }}
          />
          <NavLink
            label="Assets & Net Worth"
            leftSection={<IconCar size="1.1rem" />}
            active={view === 'assets'}
            onClick={() => { setView('assets'); if (mobileOpened) closeMobile(); }}
            styles={{ label: { fontWeight: 600 } }}
          />
          {settings.savingsEnabled && (
            <NavLink
              label="Savings"
              leftSection={<IconPigMoney size="1.1rem" />}
              active={view === 'savings'}
              onClick={() => { setView('savings'); if (mobileOpened) closeMobile(); }}
              styles={{ label: { fontWeight: 600 } }}
            />
          )}
          <NavLink
            label="Settings"
            leftSection={<IconSettings size="1.1rem" />}
            active={view === 'settings'}
            onClick={() => { setView('settings'); if (mobileOpened) closeMobile(); }}
            styles={{ label: { fontWeight: 600 } }}
          />
          <NavLink
            label="About & Rules"
            leftSection={<IconInfoCircle size="1.1rem" />}
            active={view === 'info'}
            onClick={() => { setView('info'); if (mobileOpened) closeMobile(); }}
            styles={{ label: { fontWeight: 600 } }}
          />
          <Divider my="sm" color="#2A2A2A" />
        </>
      )}

      {/* Quick User Attribution Filter */}
      <Text size="xs" fw={700} c="dimmed" mt={4}>HOUSEHOLD PROFILE</Text>
      <SegmentedControl
        size="xs"
        value={selectedUser}
        onChange={setSelectedUser}
        data={[
          { label: 'All', value: 'All' },
          ...settings.users.map(u => ({ label: u.name, value: u.name }))
        ]}
        styles={{
          root: { backgroundColor: '#141414', border: '1px solid #2A2A2A' },
          indicator: { backgroundColor: ACCENT_COLOR },
          control: { border: 'none' },
          label: { fontSize: 'xs', fontWeight: 600 }
        }}
      />

      {/* Date Period Filter */}
      <Text size="xs" fw={700} c="dimmed" mt="xs">PERIOD RANGE</Text>
      <Select
        size="xs"
        data={PERIOD_OPTIONS}
        value={period}
        onChange={val => {
          setPeriod(val);
          if (val !== 'Custom Range') {
            setStartDate(null);
            setEndDate(null);
          }
        }}
      />

      {period === 'Custom Range' && (
        <Stack gap="xs" mt="xs">
          <DateInput
            firstDayOfWeek={0}
            size="xs"
            label="From"
            placeholder="Start date"
            value={startDate}
            onChange={setStartDate}
            clearable
          />
          <DateInput
            firstDayOfWeek={0}
            size="xs"
            label="To"
            placeholder="End date"
            value={endDate}
            onChange={setEndDate}
            clearable
          />
        </Stack>
      )}

      {/* Payment Method Filters */}
      <Group justify="space-between" align="center" mt="xs">
        <Text size="xs" fw={700} c="dimmed">PAYMENT METHODS</Text>
        <Group gap={6}>
          <Button 
            variant="subtle" 
            size="compact-xs" 
            color="teal" 
            onClick={() => setSelectedMethods(allMethods)}
          >
            All
          </Button>
          <Button 
            variant="subtle" 
            size="compact-xs" 
            color="gray" 
            onClick={() => setSelectedMethods([])}
          >
            None
          </Button>
        </Group>
      </Group>

      <ScrollArea.Autosize mah={160} type="auto">
        <Stack gap={4}>
          {allMethods.map(m => (
            <Checkbox
              key={m}
              size="xs"
              label={m}
              checked={selectedMethods.includes(m)}
              onChange={e => {
                if (e.currentTarget.checked) {
                  setSelectedMethods(prev => [...prev, m]);
                } else {
                  setSelectedMethods(prev => prev.filter(x => x !== m));
                }
              }}
            />
          ))}
        </Stack>
      </ScrollArea.Autosize>
    </Stack>
  );

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 240,
        breakpoint: 'sm',
        collapsed: { mobile: !mobileOpened }
      }}
      padding="md"
      styles={{
        main: { backgroundColor: '#121212', color: '#F4F4F5', minHeight: '100vh' },
        navbar: { backgroundColor: '#18181B', borderRight: '1px solid #27272A' },
        header: { backgroundColor: '#18181B', borderBottom: '1px solid #27272A' }
      }}
    >
      <AppShell.Header px="md" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Group gap="sm">
          <Burger opened={mobileOpened} onClick={toggleMobile} hiddenFrom="sm" size="sm" color="white" />
          <Group 
            gap="xs" 
            style={{ cursor: 'pointer', userSelect: 'none' }} 
            onClick={cycleUser}
            title="Tap to cycle active profile"
          >
            <ThemeIcon variant="light" color="teal" size="md">
              <IconWallet size="1.2rem" />
            </ThemeIcon>
            <Title order={3} style={{ color: getTitleColor(), transition: 'color 0.2s ease', letterSpacing: '-0.5px' }}>
              BudgetStar
            </Title>
          </Group>
        </Group>

        <Group gap="xs">
          <ActionIcon
            component="a"
            href="https://github.com/elricclark1/BudgetStar"
            target="_blank"
            rel="noopener noreferrer"
            variant="subtle"
            color="gray"
            size="md"
            title="Open Source on GitHub"
            aria-label="Open Source on GitHub"
          >
            <IconBrandGithub size="1.2rem" />
          </ActionIcon>
          <Badge 
            variant="light" 
            size="md"
            color={getUserColor(selectedUser)}
            onClick={cycleUser}
            style={{ cursor: 'pointer', userSelect: 'none' }}
          >
            {selectedUser === 'All' ? 'Shared (All)' : selectedUser}
          </Badge>
          <Button
            size="xs"
            color="green.8"
            leftSection={<IconPlus size="0.9rem" />}
            onClick={() => {
              if (editingId) setEditingId(null);
              toggleForm();
            }}
          >
            LOG EXPENSE
          </Button>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Group 
          align="center" 
          gap="sm" 
          mb="md" 
          px="xs" 
          style={{ cursor: 'pointer', userSelect: 'none' }} 
          onClick={cycleUser}
        >
          <ThemeIcon variant="filled" color="teal" size="lg" radius="md">
            <IconWallet size="1.4rem" />
          </ThemeIcon>
          <div>
            <Title order={4} style={{ color: getTitleColor(), lineHeight: 1.2 }}>
              BudgetStar
            </Title>
            <Text size="xs" c="dimmed">
              {selectedUser === 'All' ? 'Shared View (All)' : `${selectedUser}'s Profile`}
            </Text>
          </div>
        </Group>
        <Divider mb="sm" color="#27272A" />
        <AppShell.Section grow component={ScrollArea}>
          <FilterContent />
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>
        <Container size="xl" px={{ base: 4, sm: 'md' }}>
          {demoNotice && (
            <Alert icon={<IconCheck size="1rem" />} color="teal" mb="md" withCloseButton onClose={() => setDemoNotice(null)}>
              {demoNotice}
            </Alert>
          )}

          {/* Quick Expense Entry Drawer / Collapse */}
          <Collapse in={opened}>
            <Paper p="md" mb="xl" withBorder style={{ backgroundColor: '#1E1E24', borderColor: '#2E2E33' }}>
              <Group justify="space-between" mb="sm">
                <Text fw={700} size="sm">{editingId ? 'Edit Transaction' : 'Log New Expense'}</Text>
                <ActionIcon variant="subtle" color="gray" onClick={toggleForm}><IconX size="1rem" /></ActionIcon>
              </Group>
              <Grid>
                <Grid.Col span={{ base: 12, md: 4 }}>
                  <TextInput 
                    label="Description" 
                    placeholder="e.g. Grocery trip, Coffee, Rent"
                    value={form.description} 
                    onChange={e => setForm({...form, description: e.target.value})} 
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 6, md: 4 }}>
                  <NumberInput 
                    label="Amount" 
                    prefix="$" 
                    value={form.amount} 
                    onChange={val => setForm({...form, amount: val})} 
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 6, md: 4 }}>
                  <DateInput 
                    firstDayOfWeek={0} 
                    label="Date" 
                    value={form.date} 
                    onChange={date => setForm({...form, date})} 
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 6, md: 4 }}>
                  <Select 
                    label="Category" 
                    data={allCategories} 
                    value={form.category} 
                    onChange={val => setForm({...form, category: val})} 
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 6, md: 4 }}>
                  <Select 
                    label="Payment Method" 
                    data={allMethods} 
                    value={form.method} 
                    onChange={val => setForm({...form, method: val})} 
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 6, md: 4 }}>
                  <Select 
                    label="Household Member" 
                    data={settings.users.map(u => u.name)} 
                    value={form.user} 
                    onChange={val => setForm({...form, user: val})} 
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                  <Text size="sm" mb={4}>Necessity Rating ({form.necessity}★)</Text>
                  <Slider 
                    min={1} 
                    max={5} 
                    step={1} 
                    value={form.necessity} 
                    onChange={val => setForm({...form, necessity: val})} 
                    color={ACCENT_COLOR} 
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 6, md: 4 }} style={{ display: 'flex', alignItems: 'center', paddingTop: '1.4rem' }}>
                  <Checkbox 
                    label="Reimbursed Expense?" 
                    checked={form.is_reimbursed || false} 
                    onChange={e => {
                      const checked = e.currentTarget.checked;
                      setForm({
                        ...form,
                        is_reimbursed: checked,
                        reimbursement_amount: checked ? (form.reimbursement_amount || form.amount) : 0
                      });
                    }}
                  />
                </Grid.Col>
                {form.is_reimbursed && (
                  <Grid.Col span={{ base: 6, md: 4 }}>
                    <NumberInput 
                      label="Reimbursement Amount" 
                      prefix="$" 
                      value={form.reimbursement_amount} 
                      onChange={val => setForm({...form, reimbursement_amount: val})} 
                    />
                  </Grid.Col>
                )}
                <Grid.Col span={12}>
                  <Textarea 
                    label="Notes / Context" 
                    placeholder="Context, details, or split items" 
                    value={form.notes || ''} 
                    onChange={e => setForm({...form, notes: e.target.value})} 
                  />
                </Grid.Col>
                <Grid.Col span={12}>
                  <Group justify="flex-end">
                    <Button variant="default" onClick={toggleForm}>Cancel</Button>
                    <Button color="green.8" onClick={handleSubmit}>
                      {editingId ? 'UPDATE TRANSACTION' : 'SAVE EXPENSE'}
                    </Button>
                  </Group>
                </Grid.Col>
              </Grid>
            </Paper>
          </Collapse>

          {/* VIEW: DASHBOARD */}
          {view === 'dashboard' && (
            <Stack gap="xl">
              {/* Top 5 Metrics Overview */}
              <SimpleGrid cols={{ base: 2, sm: 3, md: 5 }} spacing={{ base: 'xs', sm: 'md' }}>
                <Paper p="md" withBorder style={{ backgroundColor: '#1E1E24', borderColor: '#2E2E33', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Text size="xs" c="dimmed" fw={700}>TOTAL SPEND</Text>
                  <Text fz={{ base: '1.4rem', sm: '1.6rem', md: '1.8rem' }} fw={800} my={4}>
                    ${stats.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Text>
                  <Text size="xs" c="dimmed">in selected period</Text>
                </Paper>

                <Paper p="md" withBorder style={{ backgroundColor: '#1E1E24', borderColor: '#2E2E33', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Text size="xs" c="dimmed" fw={700}>SPENT THIS MONTH</Text>
                  <Text fz={{ base: '1.4rem', sm: '1.6rem', md: '1.8rem' }} fw={800} my={4}>
                    ${stats.spentThisMonth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Text>
                  <Text size="xs" c="dimmed">current month to date</Text>
                </Paper>

                <Paper p="md" withBorder style={{ backgroundColor: '#1E1E24', borderColor: '#2E2E33', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Text size="xs" c="dimmed" fw={700}>MONTHLY PACE</Text>
                  <Text fz={{ base: '1.4rem', sm: '1.6rem', md: '1.8rem' }} fw={800} my={4} c={stats.pacePercent <= 100 ? "green.4" : "red.4"}>
                    {stats.pacePercent.toFixed(0)}%
                  </Text>
                  <Text size="xs" c="dimmed" title="Comparison against past 3-month variable spending baseline">
                    vs 3-mo pace (${stats.past3MonthsAvg.toFixed(0)}/mo)
                  </Text>
                </Paper>

                <Paper p="md" withBorder style={{ backgroundColor: '#1E1E24', borderColor: '#2E2E33', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Text size="xs" c="dimmed" fw={700}>AVG. / MONTH</Text>
                  <Text fz={{ base: '1.4rem', sm: '1.6rem', md: '1.8rem' }} fw={800} my={4}>
                    ${stats.monthlyAvg.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Text>
                  <Text size="xs" c="dimmed">historical monthly avg</Text>
                </Paper>

                <Paper p="md" withBorder style={{ backgroundColor: '#1E1E24', borderColor: '#2E2E33', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Text size="xs" c="dimmed" fw={700}>DAILY PACE LIMIT</Text>
                  <Text fz={{ base: '1.4rem', sm: '1.6rem', md: '1.8rem' }} fw={800} my={4} c={stats.maxDailyRemaining >= stats.actualDailyAvg ? "green.4" : "red.4"}>
                    ${stats.maxDailyRemaining.toFixed(2)}/d
                  </Text>
                  <Text size="xs" c="dimmed">Actual: ${stats.actualDailyAvg.toFixed(2)}/day</Text>
                </Paper>
              </SimpleGrid>

              {/* Category Battery Goals */}
              <div>
                <Group justify="space-between" align="center" mb="md">
                  <Group gap="xs">
                    <ThemeIcon variant="light" color="teal" size="sm">
                      <IconTarget size="1rem" />
                    </ThemeIcon>
                    <Title order={4}>Budget Goals</Title>
                  </Group>
                  <Button 
                    variant="subtle" 
                    size="xs" 
                    color="teal" 
                    leftSection={<IconPlus size="0.85rem" />}
                    onClick={() => setView('goals')}
                  >
                    ADD GOAL
                  </Button>
                </Group>

                {goals.length === 0 ? (
                  <Paper p="md" withBorder style={{ backgroundColor: '#1E1E24', borderColor: '#2E2E33', textAlign: 'center' }}>
                    <Text size="sm" c="dimmed">No budget goals defined yet.</Text>
                    <Button size="xs" variant="light" color="teal" mt="xs" onClick={() => setView('goals')}>
                      CREATE FIRST GOAL
                    </Button>
                  </Paper>
                ) : (
                  <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="md">
                    {goals.filter(g => {
                      if (!selectedUser || selectedUser === 'All') return true;
                      const u = (g.user || 'Shared').toLowerCase();
                      return u === 'shared' || u === 'both' || u === selectedUser.toLowerCase();
                    }).map(g => {
                      const now = dayjs();
                      const start = g.period === 'month' ? now.startOf('month') : now.startOf('week');
                      const end = g.period === 'month' ? now.endOf('month') : now.endOf('week');
                      const goalCategories = parseGoalCategories(g.category);
                      const goalCategoriesLower = goalCategories.map(c => c.toLowerCase());
                      const goalUserLower = (g.user || 'Shared').toLowerCase();

                      const matchingTxns = transactions.filter(t => {
                        const catLower = (t.category || '').toLowerCase();
                        if (!goalCategoriesLower.includes(catLower)) return false;
                        const d = dayjs(t.date);
                        const inPeriod = (d.isAfter(start) || d.isSame(start, 'day')) && (d.isBefore(end) || d.isSame(end, 'day'));
                        if (!inPeriod) return false;
                        if (goalUserLower === 'shared' || goalUserLower === 'both') return true;
                        return (t.user || settings.users[0]?.name || 'User 1').toLowerCase() === goalUserLower;
                      });

                      const spent = matchingTxns.reduce((acc, t) => acc + (t.amount - (t.reimbursement_amount || 0)), 0);
                      const batteryLevel = Math.max(0, 100 - (spent / g.amount) * 100);
                      const isOver = spent > g.amount;
                      const batteryColor = isOver ? 'red' : getBatteryColor(batteryLevel);

                      return (
                        <Paper key={g.id} p="md" withBorder style={{ backgroundColor: '#1E1E24', borderColor: '#2E2E33' }}>
                          <Group justify="space-between" align="center" mb="xs">
                            <Text fw={700} size="sm" truncate>
                              {g.category}
                            </Text>
                            <Group gap={6}>
                              <Badge size="xs" variant="outline" color={getUserColor(g.user)}>
                                {g.user || 'Shared'}
                              </Badge>
                              <Badge size="xs" variant="light" color={g.period === 'month' ? 'blue' : 'grape'}>
                                {g.period === 'month' ? 'Monthly' : 'Weekly'}
                              </Badge>
                            </Group>
                          </Group>

                          <Group justify="space-between" mb="xs">
                            <Text size="xs" c="dimmed">Spent: ${spent.toFixed(2)}</Text>
                            <Text size="xs" fw={600}>Target: ${g.amount.toFixed(2)}</Text>
                          </Group>

                          <Progress 
                            value={batteryLevel} 
                            color={batteryColor} 
                            size="lg" 
                            radius="xl"
                            striped={isOver}
                            animated={isOver}
                            styles={{ root: { backgroundColor: '#141416' } }}
                          />

                          {isOver ? (
                            <Text c="red.4" size="xs" mt="xs" fw={700}>
                              Battery Depleted! Over by ${(spent - g.amount).toFixed(2)}
                            </Text>
                          ) : (
                            <Group justify="space-between" mt="xs">
                              <Text c={batteryColor} size="xs" fw={600}>
                                {batteryLevel.toFixed(0)}% Remaining
                              </Text>
                              <Text c="dimmed" size="xs">
                                ${(g.amount - spent).toFixed(2)} left
                              </Text>
                            </Group>
                          )}
                        </Paper>
                      );
                    })}
                  </SimpleGrid>
                )}
              </div>

              {/* Spending by Category (Chart + Rankings) */}
              <Paper p="md" withBorder style={{ backgroundColor: '#1E1E24', borderColor: '#2E2E33' }}>
                <Group justify="space-between" mb="md" align="center">
                  <Title order={4}>Spending by Category</Title>
                  <SegmentedControl
                    size="xs"
                    data={[
                      { label: 'Pie Chart', value: 'pie' },
                      { label: 'Rankings', value: 'ranking' }
                    ]}
                    value={categoryChartView}
                    onChange={setCategoryChartView}
                    styles={{
                      root: { backgroundColor: '#141416', border: '1px solid #27272A' },
                      indicator: { backgroundColor: ACCENT_COLOR }
                    }}
                  />
                </Group>

                <Box style={{ height: 360, width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    {categoryChartView === 'pie' ? (
                      <PieChart>
                        <Pie
                          data={chartData.pieData}
                          innerRadius={60}
                          outerRadius={120}
                          paddingAngle={2}
                          dataKey="value"
                          labelLine={false}
                          label={renderCustomizedLabel}
                        >
                          {chartData.pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={getCategoryColor(entry.name)} stroke="#1E1E24" />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#18181B', border: '1px solid #27272A', borderRadius: 6 }}
                          formatter={(value) => `$${Number(value).toFixed(2)}`}
                        />
                        <Legend />
                      </PieChart>
                    ) : (
                      <BarChart layout="vertical" data={rankingData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="name" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} width={100} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#18181B', border: '1px solid #27272A', borderRadius: 6 }}
                          formatter={(value, name, props) => [`$${props.payload.amount.toFixed(2)} (${value.toFixed(1)}%)`, 'Spent']}
                        />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={18}>
                          {rankingData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={getCategoryColor(entry.name)} />
                          ))}
                          <LabelList dataKey="value" position="right" formatter={(v) => `${v.toFixed(1)}%`} fill="#9CA3AF" fontSize={11} />
                        </Bar>
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Stack>
          )}

          {/* VIEW: TRENDS & NECESSITY ANALYTICS */}
          {view === 'trends' && (
            <Stack gap="xl">
              {/* Monthly Cashflow Comparison */}
              <Paper p="md" withBorder style={{ backgroundColor: '#1E1E24', borderColor: '#2E2E33' }}>
                <Title order={4} mb="md">Monthly Income vs. Spending Comparison</Title>
                <Box style={{ height: 320, width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyIncomeSpendingData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                      <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
                      <YAxis stroke="#9CA3AF" fontSize={12} />
                      <Tooltip content={<CustomMonthlyTooltip />} />
                      <Legend />
                      <Bar dataKey="NetIncome" fill="#22C55E" name="Income" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="TotalSpending" fill="#EF4444" name="Spending" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>

              {/* Necessity Spreadsheet Table */}
              <Paper p="md" withBorder style={{ backgroundColor: '#1E1E24', borderColor: '#2E2E33' }}>
                <Group justify="space-between" align="center" mb="md">
                  <div>
                    <Group gap="xs">
                      <ThemeIcon variant="light" color="teal" size="sm">
                        <IconScale size="1rem" />
                      </ThemeIcon>
                      <Title order={4}>Category Necessity & Consistency</Title>
                    </Group>
                    <Text size="xs" c="dimmed">Purchase distribution across 1★ to 5★ ratings</Text>
                  </div>
                  <Badge variant="light" color="teal" size="sm">
                    {necessityTotals.count} Total Purchases
                  </Badge>
                </Group>

                <ScrollArea type="auto">
                  <Table 
                    striped 
                    highlightOnHover 
                    withTableBorder 
                    withColumnBorders
                    styles={{
                      table: { backgroundColor: '#141416' },
                      th: { backgroundColor: '#1E1E24', color: '#FFFFFF', fontSize: '0.78rem', padding: '8px 10px', borderBottom: '1px solid #2E2E33' },
                      td: { fontSize: '0.78rem', padding: '8px 10px', borderColor: '#27272A' }
                    }}
                  >
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th style={{ cursor: 'pointer' }} onClick={() => handleNecessitySort('category')}>
                          Category {necessitySort.key === 'category' ? (necessitySort.direction === 'asc' ? '▲' : '▼') : ''}
                        </Table.Th>
                        <Table.Th style={{ textAlign: 'center', color: '#F87171', cursor: 'pointer' }} onClick={() => handleNecessitySort('star1')} title="1 Star - Luxury / Discretionary">
                          1★ {necessitySort.key === 'star1' ? (necessitySort.direction === 'asc' ? '▲' : '▼') : ''}
                        </Table.Th>
                        <Table.Th style={{ textAlign: 'center', color: '#FB923C', cursor: 'pointer' }} onClick={() => handleNecessitySort('star2')}>
                          2★ {necessitySort.key === 'star2' ? (necessitySort.direction === 'asc' ? '▲' : '▼') : ''}
                        </Table.Th>
                        <Table.Th style={{ textAlign: 'center', color: '#FACC15', cursor: 'pointer' }} onClick={() => handleNecessitySort('star3')}>
                          3★ {necessitySort.key === 'star3' ? (necessitySort.direction === 'asc' ? '▲' : '▼') : ''}
                        </Table.Th>
                        <Table.Th style={{ textAlign: 'center', color: '#4ADE80', cursor: 'pointer' }} onClick={() => handleNecessitySort('star4')}>
                          4★ {necessitySort.key === 'star4' ? (necessitySort.direction === 'asc' ? '▲' : '▼') : ''}
                        </Table.Th>
                        <Table.Th style={{ textAlign: 'center', color: '#22C55E', cursor: 'pointer' }} onClick={() => handleNecessitySort('star5')} title="5 Stars - Fixed / Critical">
                          5★ {necessitySort.key === 'star5' ? (necessitySort.direction === 'asc' ? '▲' : '▼') : ''}
                        </Table.Th>
                        <Table.Th style={{ textAlign: 'right', cursor: 'pointer' }} onClick={() => handleNecessitySort('count')}>
                          Count {necessitySort.key === 'count' ? (necessitySort.direction === 'asc' ? '▲' : '▼') : ''}
                        </Table.Th>
                        <Table.Th style={{ textAlign: 'right', cursor: 'pointer' }} onClick={() => handleNecessitySort('avg')}>
                          Avg ★ {necessitySort.key === 'avg' ? (necessitySort.direction === 'asc' ? '▲' : '▼') : ''}
                        </Table.Th>
                        <Table.Th style={{ textAlign: 'right', cursor: 'pointer' }} onClick={() => handleNecessitySort('avgAmount')}>
                          Avg $ {necessitySort.key === 'avgAmount' ? (necessitySort.direction === 'asc' ? '▲' : '▼') : ''}
                        </Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {sortedNecessityRows.map(row => (
                        <Table.Tr key={row.category}>
                          <Table.Td style={{ fontWeight: 600 }}>
                            <Group gap={6} wrap="nowrap">
                              <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: getCategoryColor(row.category) }} />
                              <Text size="xs">{row.category}</Text>
                            </Group>
                          </Table.Td>
                          <Table.Td style={{ textAlign: 'center', color: row.star1 > 0 ? '#F87171' : '#555' }}>{row.star1 || '-'}</Table.Td>
                          <Table.Td style={{ textAlign: 'center', color: row.star2 > 0 ? '#FB923C' : '#555' }}>{row.star2 || '-'}</Table.Td>
                          <Table.Td style={{ textAlign: 'center', color: row.star3 > 0 ? '#FACC15' : '#555' }}>{row.star3 || '-'}</Table.Td>
                          <Table.Td style={{ textAlign: 'center', color: row.star4 > 0 ? '#4ADE80' : '#555' }}>{row.star4 || '-'}</Table.Td>
                          <Table.Td style={{ textAlign: 'center', color: row.star5 > 0 ? '#22C55E' : '#555' }}>{row.star5 || '-'}</Table.Td>
                          <Table.Td style={{ textAlign: 'right', fontWeight: 600 }}>{row.count}</Table.Td>
                          <Table.Td style={{ textAlign: 'right', fontWeight: 700, color: row.avg >= 4 ? '#22C55E' : row.avg >= 3 ? '#FACC15' : '#FB923C' }}>
                            {row.avg.toFixed(1)} ★
                          </Table.Td>
                          <Table.Td style={{ textAlign: 'right' }}>${row.avgAmount.toFixed(2)}</Table.Td>
                        </Table.Tr>
                      ))}
                      {sortedNecessityRows.length === 0 && (
                        <Table.Tr>
                          <Table.Td colSpan={9} style={{ textAlign: 'center', color: '#777', padding: '24px' }}>
                            No transactions found matching current filters.
                          </Table.Td>
                        </Table.Tr>
                      )}
                    </Table.Tbody>
                    {sortedNecessityRows.length > 0 && (
                      <Table.Tfoot style={{ backgroundColor: '#18181B', borderTop: '2px solid #2E2E33' }}>
                        <Table.Tr>
                          <Table.Td style={{ fontWeight: 700 }}>Total / Overall Avg</Table.Td>
                          <Table.Td style={{ textAlign: 'center', fontWeight: 700, color: '#F87171' }}>{necessityTotals.star1}</Table.Td>
                          <Table.Td style={{ textAlign: 'center', fontWeight: 700, color: '#FB923C' }}>{necessityTotals.star2}</Table.Td>
                          <Table.Td style={{ textAlign: 'center', fontWeight: 700, color: '#FACC15' }}>{necessityTotals.star3}</Table.Td>
                          <Table.Td style={{ textAlign: 'center', fontWeight: 700, color: '#4ADE80' }}>{necessityTotals.star4}</Table.Td>
                          <Table.Td style={{ textAlign: 'center', fontWeight: 700, color: '#22C55E' }}>{necessityTotals.star5}</Table.Td>
                          <Table.Td style={{ textAlign: 'right', fontWeight: 700 }}>{necessityTotals.count}</Table.Td>
                          <Table.Td style={{ textAlign: 'right', fontWeight: 700, color: '#2DD4BF' }}>{necessityTotals.avgStar.toFixed(1)} ★</Table.Td>
                          <Table.Td style={{ textAlign: 'right', fontWeight: 700 }}>${necessityTotals.avgAmount.toFixed(2)}</Table.Td>
                        </Table.Tr>
                      </Table.Tfoot>
                    )}
                  </Table>
                </ScrollArea>
              </Paper>
            </Stack>
          )}

          {/* VIEW: INCOME & CASHFLOW */}
          {view === 'cashflow' && (
            <Stack gap="xl">
              <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
                <Paper p="md" withBorder style={{ backgroundColor: '#1E1E24', borderColor: '#2E2E33' }}>
                  <Text size="xs" c="dimmed" fw={700}>TOTAL INCOME</Text>
                  <Text size="xl" fw={800} c="teal.4" mt="xs">
                    ${incomeStats.grossIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Text>
                  <Text size="xs" c="dimmed" mt={4}>
                    {settings.tithingEnabled ? "Inferred via charitable giving" : "Logged income & baselines"}
                  </Text>
                </Paper>

                <Paper p="md" withBorder style={{ backgroundColor: '#1E1E24', borderColor: '#2E2E33' }}>
                  <Text size="xs" c="dimmed" fw={700}>TOTAL LIVING EXPENSES</Text>
                  <Text size="xl" fw={800} c="orange.4" mt="xs">
                    ${incomeStats.livingSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Text>
                  <Text size="xs" c={incomeStats.netIncome > 0 && (incomeStats.livingSpent / incomeStats.netIncome) <= 1 ? "green.4" : "red.4"} mt={4} fw={600}>
                    {incomeStats.netIncome > 0 ? ((incomeStats.livingSpent / incomeStats.netIncome) * 100).toFixed(1) : '0.0'}% of Net Income
                  </Text>
                </Paper>

                <Paper p="md" withBorder style={{ backgroundColor: '#1E1E24', borderColor: '#2E2E33' }}>
                  <Text size="xs" c="dimmed" fw={700}>NET CASHFLOW / SURPLUS</Text>
                  <Text size="xl" fw={800} c={incomeStats.netSavings >= 0 ? "green.4" : "red.4"} mt="xs">
                    ${incomeStats.netSavings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Text>
                  <Text size="xs" c="dimmed" mt={4}>Remaining income after expenses</Text>
                </Paper>

                <Paper p="md" withBorder style={{ backgroundColor: '#1E1E24', borderColor: '#2E2E33' }}>
                  <Text size="xs" c="dimmed" fw={700}>SAVINGS RATE</Text>
                  <Text size="xl" fw={800} c={incomeStats.savingsRate >= 20 ? "green.4" : "teal.4"} mt="xs">
                    {incomeStats.savingsRate.toFixed(1)}%
                  </Text>
                  <Text size="xs" c="dimmed" mt={4}>Percent of income saved</Text>
                </Paper>
              </SimpleGrid>

              {/* Optional Giving / Tithing Planner if enabled */}
              {settings.tithingEnabled && (
                <Paper p="md" withBorder style={{ backgroundColor: '#1E1E24', borderColor: '#2E2E33' }}>
                  <Title order={4} mb="xs">Giving & Income Inference Model</Title>
                  <Text size="xs" c="dimmed" mb="md">
                    Calculates gross income and take-home net based on charitable contributions and percentage donations.
                  </Text>
                  <Grid>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                      <NumberInput
                        label="Monthly Donation / Giving Amount"
                        prefix="$"
                        placeholder="Enter donation amount"
                        value={plannerTithing}
                        onChange={val => {
                          setPlannerTithing(val);
                          setPlannerGrossIncome(val ? (val * 10).toFixed(2) : '');
                        }}
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                      <NumberInput
                        label="Inferred Gross Income (10% Model)"
                        prefix="$"
                        value={plannerGrossIncome}
                        onChange={val => {
                          setPlannerGrossIncome(val);
                          setPlannerTithing(val ? (val * 0.1).toFixed(2) : '');
                        }}
                      />
                    </Grid.Col>
                  </Grid>
                </Paper>
              )}

              {/* Reimbursed Transactions Table */}
              <Paper p="md" withBorder style={{ backgroundColor: '#1E1E24', borderColor: '#2E2E33' }}>
                <Group justify="space-between" mb="md">
                  <Title order={4}>Reimbursed Expenses Log</Title>
                  <Badge variant="light" color="teal">{reimbursedTransactions.length} Reimbursed Items</Badge>
                </Group>
                <ScrollArea type="auto">
                  <Table striped highlightOnHover>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Date</Table.Th>
                        <Table.Th>Description</Table.Th>
                        <Table.Th>Category</Table.Th>
                        <Table.Th style={{ textAlign: 'right' }}>Original Amount</Table.Th>
                        <Table.Th style={{ textAlign: 'right' }}>Reimbursement</Table.Th>
                        <Table.Th style={{ textAlign: 'right' }}>Net Expense</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {reimbursedTransactions.map(t => {
                        const netCost = Math.max(0, t.amount - (t.reimbursement_amount || 0));
                        return (
                          <Table.Tr key={t.id}>
                            <Table.Td>{t.date}</Table.Td>
                            <Table.Td fw={600}>{t.description}</Table.Td>
                            <Table.Td>
                              <Badge size="xs" variant="outline" color={getCategoryColor(t.category)}>
                                {t.category}
                              </Badge>
                            </Table.Td>
                            <Table.Td style={{ textAlign: 'right' }}>${t.amount.toFixed(2)}</Table.Td>
                            <Table.Td style={{ textAlign: 'right', color: '#22C55E', fontWeight: 600 }}>
                              +${(t.reimbursement_amount || 0).toFixed(2)}
                            </Table.Td>
                            <Table.Td style={{ textAlign: 'right', fontWeight: 700 }}>
                              ${netCost.toFixed(2)}
                            </Table.Td>
                          </Table.Tr>
                        );
                      })}
                      {reimbursedTransactions.length === 0 && (
                        <Table.Tr>
                          <Table.Td colSpan={6} style={{ textAlign: 'center', color: '#777', padding: '16px' }}>
                            No reimbursed transactions found.
                          </Table.Td>
                        </Table.Tr>
                      )}
                    </Table.Tbody>
                  </Table>
                </ScrollArea>
              </Paper>
            </Stack>
          )}

          {/* VIEW: PURCHASE LOG */}
          {view === 'log' && (
            <Stack gap="md">
              <Paper p="md" withBorder style={{ backgroundColor: '#1E1E24', borderColor: '#2E2E33' }}>
                <Group justify="space-between" align="center" mb="md" wrap="wrap">
                  <TextInput
                    placeholder="Search by description, category, user, notes..."
                    leftSection={<IconSearch size="1rem" />}
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{ flex: 1, minWidth: 260 }}
                  />
                  <Group gap="xs" wrap="wrap">
                    <Button 
                      variant="outline" 
                      color="teal" 
                      size="sm" 
                      leftSection={<IconDownload size="1rem" />}
                      onClick={handleExportJSON}
                      title="Download complete JSON backup including configs and all records"
                    >
                      BACKUP (JSON)
                    </Button>
                    <Button 
                      variant="outline" 
                      color="cyan" 
                      size="sm" 
                      leftSection={<IconUpload size="1rem" />}
                      onClick={() => document.getElementById('log-json-import').click()}
                      title="Restore complete JSON backup"
                    >
                      RESTORE (JSON)
                    </Button>
                    <input
                      type="file"
                      id="log-json-import"
                      style={{ display: 'none' }}
                      accept=".json"
                      onChange={handleImportJSON}
                    />
                    <Button 
                      variant="subtle" 
                      color="gray" 
                      size="sm" 
                      leftSection={<IconDownload size="1rem" />}
                      onClick={handleExportCSV}
                      title="Export transactions table as CSV spreadsheet"
                    >
                      CSV
                    </Button>
                    <Button
                      color="green.8"
                      size="sm"
                      leftSection={<IconPlus size="1rem" />}
                      onClick={() => {
                        setEditingId(null);
                        toggleForm();
                      }}
                    >
                      LOG EXPENSE
                    </Button>
                  </Group>
                </Group>

                <ScrollArea type="auto">
                  <Table 
                    striped 
                    highlightOnHover 
                    withTableBorder
                    styles={{
                      table: { backgroundColor: '#141416' },
                      th: { backgroundColor: '#1E1E24', color: '#FFFFFF', padding: '8px 12px' },
                      td: { padding: '8px 12px', borderColor: '#27272A' }
                    }}
                  >
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th style={{ cursor: 'pointer' }} onClick={() => setSortConfig(p => ({ key: 'date', direction: p.key === 'date' && p.direction === 'desc' ? 'asc' : 'desc' }))}>
                          Date {sortConfig.key === 'date' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                        </Table.Th>
                        <Table.Th>Description</Table.Th>
                        <Table.Th style={{ textAlign: 'right', cursor: 'pointer' }} onClick={() => setSortConfig(p => ({ key: 'amount', direction: p.key === 'amount' && p.direction === 'desc' ? 'asc' : 'desc' }))}>
                          Amount {sortConfig.key === 'amount' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                        </Table.Th>
                        <Table.Th>Category</Table.Th>
                        <Table.Th>Method</Table.Th>
                        <Table.Th>Member</Table.Th>
                        <Table.Th style={{ textAlign: 'center' }}>Rating</Table.Th>
                        <Table.Th style={{ textAlign: 'right' }}>Actions</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {[...filteredTransactions].sort((a, b) => {
                        const mult = sortConfig.direction === 'asc' ? 1 : -1;
                        if (sortConfig.key === 'amount') return mult * (a.amount - b.amount);
                        return mult * a.date.localeCompare(b.date);
                      }).map(t => (
                        <Table.Tr key={t.id}>
                          <Table.Td style={{ whiteSpace: 'nowrap' }}>{t.date}</Table.Td>
                          <Table.Td>
                            <Text size="sm" fw={600}>{t.description}</Text>
                            {t.notes && <Text size="xs" c="dimmed">{t.notes}</Text>}
                            {t.is_reimbursed && (
                              <Badge size="xs" color="teal" variant="light" mt={2}>
                                Reimbursed: ${t.reimbursement_amount?.toFixed(2)}
                              </Badge>
                            )}
                          </Table.Td>
                          <Table.Td style={{ textAlign: 'right', fontWeight: 700 }}>
                            ${t.amount.toFixed(2)}
                          </Table.Td>
                          <Table.Td>
                            <Badge size="xs" variant="outline" color={getCategoryColor(t.category)}>
                              {t.category}
                            </Badge>
                          </Table.Td>
                          <Table.Td style={{ fontSize: '0.8rem' }}>{t.method}</Table.Td>
                          <Table.Td>
                            <Badge size="xs" variant="light" color={getUserColor(t.user)}>
                              {t.user || 'User 1'}
                            </Badge>
                          </Table.Td>
                          <Table.Td style={{ textAlign: 'center', color: '#FACC15', fontWeight: 600 }}>
                            {t.necessity}★
                          </Table.Td>
                          <Table.Td style={{ textAlign: 'right' }}>
                            <Group gap={4} justify="flex-end">
                              <ActionIcon 
                                variant="subtle" 
                                color="blue" 
                                size="sm"
                                onClick={() => {
                                  setEditingId(t.id);
                                  setForm({
                                    date: new Date(t.date),
                                    description: t.description,
                                    amount: t.amount,
                                    necessity: t.necessity,
                                    method: t.method,
                                    category: t.category,
                                    user: t.user || 'User 1',
                                    tag: t.tag || '',
                                    notes: t.notes || '',
                                    is_reimbursed: t.is_reimbursed || false,
                                    reimbursement_amount: t.reimbursement_amount || ''
                                  });
                                  if (!opened) toggleForm();
                                }}
                              >
                                <IconPencil size="1rem" />
                              </ActionIcon>
                              <ActionIcon 
                                variant="subtle" 
                                color="red" 
                                size="sm"
                                onClick={() => handleDelete(t.id)}
                              >
                                <IconTrash size="1rem" />
                              </ActionIcon>
                            </Group>
                          </Table.Td>
                        </Table.Tr>
                      ))}
                      {filteredTransactions.length === 0 && (
                        <Table.Tr>
                          <Table.Td colSpan={8} style={{ textAlign: 'center', color: '#777', padding: '24px' }}>
                            No transactions found matching search or active filters.
                          </Table.Td>
                        </Table.Tr>
                      )}
                    </Table.Tbody>
                  </Table>
                </ScrollArea>
              </Paper>
            </Stack>
          )}

          {/* VIEW: BUDGET GOALS */}
          {view === 'goals' && (
            <Stack gap="xl">
              <Paper p="md" withBorder style={{ backgroundColor: '#1E1E24', borderColor: '#2E2E33' }}>
                <Title order={4} mb="md">{editingGoal ? 'Edit Budget Goal' : 'Create Budget Goal'}</Title>
                <Grid>
                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <MultiSelect
                      label="Categories (Select one or multiple)"
                      data={allCategories}
                      value={goalForm.categories}
                      onChange={val => setGoalForm({...goalForm, categories: val})}
                      searchable
                      clearable
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 6, md: 3 }}>
                    <NumberInput
                      label="Budget Amount Target"
                      prefix="$"
                      value={goalForm.amount}
                      onChange={val => setGoalForm({...goalForm, amount: val})}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 6, md: 3 }}>
                    <Select
                      label="Timeframe"
                      data={[
                        { label: 'Monthly', value: 'month' },
                        { label: 'Weekly', value: 'week' }
                      ]}
                      value={goalForm.period}
                      onChange={val => setGoalForm({...goalForm, period: val})}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <Select
                      label="Assigned Profile"
                      data={[
                        { label: 'Shared / Both', value: 'Shared' },
                        ...settings.users.map(u => ({ label: u.name, value: u.name }))
                      ]}
                      value={goalForm.user}
                      onChange={val => setGoalForm({...goalForm, user: val})}
                    />
                  </Grid.Col>
                  <Grid.Col span={12}>
                    <Group justify="flex-end">
                      {editingGoal && (
                        <Button variant="default" onClick={() => {
                          setEditingGoal(null);
                          setGoalForm({ categories: ['Groceries'], amount: 100, period: 'month', user: 'Shared' });
                        }}>
                          Cancel
                        </Button>
                      )}
                      <Button color="teal" onClick={handleGoalSubmit}>
                        {editingGoal ? 'UPDATE GOAL' : 'CREATE GOAL'}
                      </Button>
                    </Group>
                  </Grid.Col>
                </Grid>
              </Paper>

              <Title order={4}>All Active Goals</Title>
              <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="md">
                {goals.map(g => (
                  <Paper key={g.id} p="md" withBorder style={{ backgroundColor: '#1E1E24', borderColor: '#2E2E33' }}>
                    <Group justify="space-between" align="center" mb="xs">
                      <Text fw={700} size="sm">{g.category}</Text>
                      <Group gap={6}>
                        <Badge size="xs" variant="outline" color={getUserColor(g.user)}>{g.user || 'Shared'}</Badge>
                        <Badge size="xs" variant="light">{g.period === 'month' ? 'Monthly' : 'Weekly'}</Badge>
                      </Group>
                    </Group>
                    <Text size="lg" fw={800} mb="sm">${g.amount.toFixed(2)} target</Text>
                    <Group justify="flex-end" gap="xs">
                      <ActionIcon variant="subtle" color="blue" size="sm" onClick={() => {
                        setEditingGoal(g);
                        setGoalForm({
                          categories: parseGoalCategories(g.category),
                          amount: g.amount,
                          period: g.period,
                          user: g.user || 'Shared'
                        });
                      }}>
                        <IconPencil size="1rem" />
                      </ActionIcon>
                      <ActionIcon variant="subtle" color="red" size="sm" onClick={() => handleDeleteGoal(g.id)}>
                        <IconTrash size="1rem" />
                      </ActionIcon>
                    </Group>
                  </Paper>
                ))}
              </SimpleGrid>
            </Stack>
          )}

          {/* VIEW: RECURRING EXPENSES / SUBSCRIPTIONS */}
          {view === 'recurrings' && (
            <Stack gap="xl">
              <Paper p="md" withBorder style={{ backgroundColor: '#1E1E24', borderColor: '#2E2E33' }}>
                <Title order={4} mb="md">{editingRecurring ? 'Edit Recurring Expense' : 'Add Recurring Subscription'}</Title>
                <Grid>
                  <Grid.Col span={{ base: 12, md: 4 }}>
                    <TextInput
                      label="Service / Item Name"
                      placeholder="e.g. Netflix, Gym, Internet"
                      value={recurringForm.name}
                      onChange={e => setRecurringForm({...recurringForm, name: e.target.value})}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 6, md: 2 }}>
                    <NumberInput
                      label="Amount"
                      prefix="$"
                      value={recurringForm.amount}
                      onChange={val => setRecurringForm({...recurringForm, amount: val})}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 6, md: 3 }}>
                    <Select
                      label="Category"
                      data={allCategories}
                      value={recurringForm.category}
                      onChange={val => setRecurringForm({...recurringForm, category: val})}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 6, md: 3 }}>
                    <TextInput
                      label="Billing Day"
                      placeholder="e.g. 1st, 15th, Friday"
                      value={recurringForm.day || ''}
                      onChange={e => setRecurringForm({...recurringForm, day: e.target.value})}
                    />
                  </Grid.Col>
                  <Grid.Col span={12}>
                    <TextInput
                      label="Notes / Rationale"
                      placeholder="Purpose, terms, or cancellation reminders"
                      value={recurringForm.notes || ''}
                      onChange={e => setRecurringForm({...recurringForm, notes: e.target.value})}
                    />
                  </Grid.Col>
                  <Grid.Col span={12}>
                    <Group justify="flex-end">
                      {editingRecurring && (
                        <Button variant="default" onClick={() => {
                          setEditingRecurring(null);
                          setRecurringForm({ name: '', category: 'Subscription', amount: 10, period: 'month', notes: '', day: '1st' });
                        }}>
                          Cancel
                        </Button>
                      )}
                      <Button color="teal" onClick={handleRecurringSubmit}>
                        {editingRecurring ? 'UPDATE SUBSCRIPTION' : 'SAVE SUBSCRIPTION'}
                      </Button>
                    </Group>
                  </Grid.Col>
                </Grid>
              </Paper>

              <Group justify="space-between" align="center">
                <Title order={4}>Active Subscriptions</Title>
                <Badge variant="light" color="teal">
                  Est. ${recurrings.reduce((acc, r) => acc + (r.amount || 0), 0).toFixed(2)}/month
                </Badge>
              </Group>

              <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="md">
                {recurrings.map(r => (
                  <Paper key={r.id} p="md" withBorder style={{ backgroundColor: '#1E1E24', borderColor: '#2E2E33' }}>
                    <Group justify="space-between" align="flex-start" mb="xs">
                      <div>
                        <Text fw={700} size="sm">{r.name}</Text>
                        <Badge size="xs" variant="outline" color={getCategoryColor(r.category)} mt={4}>
                          {r.category}
                        </Badge>
                      </div>
                      <Text fw={800} size="md" c="teal.4">${r.amount.toFixed(2)}/mo</Text>
                    </Group>
                    {r.day && <Text size="xs" c="dimmed">Charge day: {r.day}</Text>}
                    {r.notes && <Text size="xs" c="dimmed" mt={4}>{r.notes}</Text>}
                    <Divider my="sm" color="#27272A" />
                    <Group justify="flex-end" gap="xs">
                      <ActionIcon variant="subtle" color="blue" size="sm" onClick={() => {
                        setEditingRecurring(r);
                        setRecurringForm({
                          name: r.name,
                          amount: r.amount,
                          category: r.category,
                          period: r.period || 'month',
                          notes: r.notes || '',
                          day: r.day || ''
                        });
                      }}>
                        <IconPencil size="1rem" />
                      </ActionIcon>
                      <ActionIcon variant="subtle" color="red" size="sm" onClick={() => handleDeleteRecurring(r.id)}>
                        <IconTrash size="1rem" />
                      </ActionIcon>
                    </Group>
                  </Paper>
                ))}
              </SimpleGrid>
            </Stack>
          )}

          {/* VIEW: ASSETS & NET WORTH */}
          {view === 'assets' && (
            <Stack gap="xl">
              <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
                <Paper p="md" withBorder style={{ backgroundColor: '#1E1E24', borderColor: '#2E2E33' }}>
                  <Text size="xs" c="dimmed" fw={700}>TOTAL ASSET VALUE</Text>
                  <Text size="xl" fw={800} c="teal.4" mt="xs">
                    ${assetTotals.totalCurrent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Text>
                  <Text size="xs" c="dimmed" mt={4}>Current estimated valuation</Text>
                </Paper>
                <Paper p="md" withBorder style={{ backgroundColor: '#1E1E24', borderColor: '#2E2E33' }}>
                  <Text size="xs" c="dimmed" fw={700}>PURCHASE COST</Text>
                  <Text size="xl" fw={800} mt="xs">
                    ${assetTotals.totalPurchase.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Text>
                  <Text size="xs" c="dimmed" mt={4}>Initial acquisition cost</Text>
                </Paper>
                <Paper p="md" withBorder style={{ backgroundColor: '#1E1E24', borderColor: '#2E2E33' }}>
                  <Text size="xs" c="dimmed" fw={700}>VALUE CHANGE</Text>
                  <Text size="xl" fw={800} c={assetTotals.change >= 0 ? "green.4" : "orange.4"} mt="xs">
                    {assetTotals.change >= 0 ? '+' : ''}${assetTotals.change.toFixed(2)}
                  </Text>
                  <Text size="xs" c="dimmed" mt={4}>{assetTotals.changePercent.toFixed(1)}% total change</Text>
                </Paper>
                <Paper p="md" withBorder style={{ backgroundColor: '#1E1E24', borderColor: '#2E2E33' }}>
                  <Text size="xs" c="dimmed" fw={700}>TRACKED ASSETS</Text>
                  <Text size="xl" fw={800} mt="xs">{assets.length}</Text>
                  <Text size="xs" c="dimmed" mt={4}>Physical & electronic items</Text>
                </Paper>
              </SimpleGrid>

              <Paper p="md" withBorder style={{ backgroundColor: '#1E1E24', borderColor: '#2E2E33' }}>
                <Title order={4} mb="md">{editingAsset ? 'Edit Asset' : 'Log New Asset'}</Title>
                <Grid>
                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <TextInput
                      label="Asset Name"
                      placeholder="e.g. Workstation PC, Vehicle, Camera"
                      value={assetForm.name}
                      onChange={e => setAssetForm({...assetForm, name: e.target.value})}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 6, md: 3 }}>
                    <NumberInput
                      label="Purchase Price"
                      prefix="$"
                      value={assetForm.purchase_price}
                      onChange={val => setAssetForm({...assetForm, purchase_price: val})}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 6, md: 3 }}>
                    <NumberInput
                      label="Estimated Current Value"
                      prefix="$"
                      value={assetForm.estimated_value}
                      onChange={val => setAssetForm({...assetForm, estimated_value: val})}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 6, md: 6 }}>
                    <DateInput
                      firstDayOfWeek={0}
                      label="Purchase Date"
                      value={assetForm.purchase_date}
                      onChange={val => setAssetForm({...assetForm, purchase_date: val})}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 6, md: 6 }}>
                    <Select
                      label="Owner / Profile"
                      data={settings.users.map(u => u.name)}
                      value={assetForm.user || 'User 1'}
                      onChange={val => setAssetForm({...assetForm, user: val})}
                    />
                  </Grid.Col>
                  <Grid.Col span={12}>
                    <Textarea
                      label="Asset Details / Log"
                      placeholder="Specs, warranty, serial number, or maintenance notes"
                      value={assetForm.description}
                      onChange={e => setAssetForm({...assetForm, description: e.target.value})}
                    />
                  </Grid.Col>
                  <Grid.Col span={12}>
                    <Group justify="flex-end">
                      {editingAsset && (
                        <Button variant="default" onClick={() => {
                          setEditingAsset(null);
                          setAssetForm({ name: '', purchase_date: new Date(), purchase_price: '', estimated_value: '', description: '', user: 'User 1', updated_at: new Date() });
                        }}>
                          Cancel
                        </Button>
                      )}
                      <Button color="teal" onClick={handleAssetSubmit}>
                        {editingAsset ? 'UPDATE ASSET' : 'SAVE ASSET'}
                      </Button>
                    </Group>
                  </Grid.Col>
                </Grid>
              </Paper>

              <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="md">
                {assets.map(a => (
                  <Paper key={a.id} p="md" withBorder style={{ backgroundColor: '#1E1E24', borderColor: '#2E2E33' }}>
                    <Group justify="space-between" align="flex-start" mb="xs">
                      <div>
                        <Text fw={700} size="sm">{a.name}</Text>
                        <Badge size="xs" variant="outline" color={getUserColor(a.user)} mt={4}>
                          {a.user || 'User 1'}
                        </Badge>
                      </div>
                      <Text fw={800} size="md" c="teal.4">${a.estimated_value.toFixed(2)}</Text>
                    </Group>
                    <Text size="xs" c="dimmed">Purchase Cost: ${a.purchase_price.toFixed(2)} ({a.purchase_date})</Text>
                    {a.description && <Text size="xs" c="dimmed" mt={4}>{a.description}</Text>}
                    <Divider my="sm" color="#27272A" />
                    <Group justify="flex-end" gap="xs">
                      <ActionIcon variant="subtle" color="blue" size="sm" onClick={() => {
                        setEditingAsset(a);
                        setAssetForm({
                          name: a.name,
                          purchase_date: new Date(a.purchase_date),
                          purchase_price: a.purchase_price,
                          estimated_value: a.estimated_value,
                          description: a.description || '',
                          user: a.user || 'User 1',
                          updated_at: new Date()
                        });
                      }}>
                        <IconPencil size="1rem" />
                      </ActionIcon>
                      <ActionIcon variant="subtle" color="red" size="sm" onClick={() => handleDeleteAsset(a.id)}>
                        <IconTrash size="1rem" />
                      </ActionIcon>
                    </Group>
                  </Paper>
                ))}
              </SimpleGrid>
            </Stack>
          )}

          {/* VIEW: SAVINGS */}
          {view === 'savings' && (
            <Stack gap="xl">
              <Paper p="md" withBorder style={{ backgroundColor: '#1E1E24', borderColor: '#2E2E33' }}>
                <Title order={4} mb="md">Record Savings Account Balance</Title>
                <Grid>
                  <Grid.Col span={{ base: 12, md: 4 }}>
                    <NumberInput
                      label="Current Balance Amount"
                      prefix="$"
                      value={savingForm.amount}
                      onChange={val => setSavingForm({...savingForm, amount: val})}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 6, md: 4 }}>
                    <DateInput
                      firstDayOfWeek={0}
                      label="Update Date"
                      value={savingForm.date}
                      onChange={val => setSavingForm({...savingForm, date: val})}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 6, md: 4 }}>
                    <Select
                      label="Savings Account"
                      data={savingsAccounts.map(acc => acc.name)}
                      value={savingForm.account_name}
                      onChange={val => setSavingForm({...savingForm, account_name: val})}
                    />
                  </Grid.Col>
                  <Grid.Col span={12}>
                    <TextInput
                      label="Notes / Checkpoint Info"
                      placeholder="e.g. End of month checkpoint, dividend reinvestment"
                      value={savingForm.notes || ''}
                      onChange={e => setSavingForm({...savingForm, notes: e.target.value})}
                    />
                  </Grid.Col>
                  <Grid.Col span={12}>
                    <Group justify="flex-end">
                      <Button color="teal" onClick={handleSavingSubmit}>
                        RECORD BALANCE
                      </Button>
                    </Group>
                  </Grid.Col>
                </Grid>
              </Paper>

              <Title order={4}>Savings Records History</Title>
              <ScrollArea type="auto">
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Date</Table.Th>
                      <Table.Th>Account</Table.Th>
                      <Table.Th style={{ textAlign: 'right' }}>Balance</Table.Th>
                      <Table.Th>Notes</Table.Th>
                      <Table.Th style={{ textAlign: 'right' }}>Actions</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {savings.map(s => (
                      <Table.Tr key={s.id}>
                        <Table.Td>{s.date}</Table.Td>
                        <Table.Td fw={600}>{s.account_name}</Table.Td>
                        <Table.Td style={{ textAlign: 'right', fontWeight: 700, color: '#2DD4BF' }}>
                          ${s.amount.toFixed(2)}
                        </Table.Td>
                        <Table.Td size="xs" c="dimmed">{s.notes || '-'}</Table.Td>
                        <Table.Td style={{ textAlign: 'right' }}>
                          <ActionIcon variant="subtle" color="red" size="sm" onClick={() => handleDeleteSaving(s.id)}>
                            <IconTrash size="1rem" />
                          </ActionIcon>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                    {savings.length === 0 && (
                      <Table.Tr>
                        <Table.Td colSpan={5} style={{ textAlign: 'center', color: '#777', padding: '16px' }}>
                          No savings records recorded.
                        </Table.Td>
                      </Table.Tr>
                    )}
                  </Table.Tbody>
                </Table>
              </ScrollArea>
            </Stack>
          )}

          {/* VIEW: SETTINGS */}
          {view === 'settings' && (
            <Stack gap="xl">
              {/* Quick Cache Bypass button */}
              <Paper p="md" withBorder style={{ backgroundColor: '#1E1E24', borderColor: '#2E2E33' }}>
                <Group justify="space-between" align="center" wrap="wrap">
                  <div>
                    <Title order={4}>Refresh Application Cache</Title>
                    <Text size="xs" c="dimmed">
                      Forces browsers and standalone web apps to clear cache and reload newest assets.
                    </Text>
                  </div>
                  <Button 
                    variant="outline" 
                    color="teal" 
                    leftSection={<IconRefresh size="1rem" />} 
                    loading={isUpdating}
                    onClick={handleForceUpdate}
                  >
                    REFRESH APP CACHE
                  </Button>
                </Group>
              </Paper>

              {/* Household Profiles Manager */}
              <Paper p="md" withBorder style={{ backgroundColor: '#1E1E24', borderColor: '#2E2E33' }}>
                <Group gap="xs" mb="xs">
                  <ThemeIcon variant="light" color="cyan" size="sm">
                    <IconUsers size="1rem" />
                  </ThemeIcon>
                  <Title order={4}>Household Profiles & Members</Title>
                </Group>
                <Text size="xs" c="dimmed" mb="md">
                  Configure the profiles tracked in your budget. You can customize names, add partner/roommate profiles, or reduce to a single user.
                </Text>

                <Stack gap="xs" mb="md">
                  {settings.users.map((u, idx) => (
                    <Group key={idx} justify="space-between" p="xs" style={{ backgroundColor: '#141416', borderRadius: 6 }}>
                      <Group gap="xs">
                        <Badge color={u.color || 'cyan'} size="sm">{u.name}</Badge>
                        <TextInput
                          size="xs"
                          value={u.name}
                          onChange={e => {
                            const newUsers = [...settings.users];
                            newUsers[idx] = { ...newUsers[idx], name: e.target.value };
                            setSettings({ ...settings, users: newUsers });
                          }}
                        />
                        <Select
                          size="xs"
                          data={['cyan', 'pink', 'blue', 'purple', 'green', 'orange', 'yellow', 'teal']}
                          value={u.color || 'cyan'}
                          onChange={val => {
                            const newUsers = [...settings.users];
                            newUsers[idx] = { ...newUsers[idx], color: val };
                            setSettings({ ...settings, users: newUsers });
                          }}
                          style={{ width: 100 }}
                        />
                      </Group>
                      {settings.users.length > 1 && (
                        <ActionIcon 
                          variant="subtle" 
                          color="red" 
                          size="sm"
                          onClick={() => {
                            const newUsers = settings.users.filter((_, i) => i !== idx);
                            setSettings({ ...settings, users: newUsers });
                            if (selectedUser === u.name) setSelectedUser('All');
                          }}
                        >
                          <IconTrash size="1rem" />
                        </ActionIcon>
                      )}
                    </Group>
                  ))}
                </Stack>

                <Button
                  size="xs"
                  variant="light"
                  color="teal"
                  leftSection={<IconPlus size="0.9rem" />}
                  onClick={() => {
                    const newName = `User ${settings.users.length + 1}`;
                    setSettings({
                      ...settings,
                      users: [...settings.users, { name: newName, color: 'blue' }]
                    });
                  }}
                >
                  ADD PROFILE
                </Button>
              </Paper>

              {/* Payment Methods Manager */}
              <Paper p="md" withBorder style={{ backgroundColor: '#1E1E24', borderColor: '#2E2E33' }}>
                <Group gap="xs" mb="xs">
                  <ThemeIcon variant="light" color="teal" size="sm">
                    <IconCreditCard size="1rem" />
                  </ThemeIcon>
                  <Title order={4}>Payment Methods</Title>
                </Group>
                <Text size="xs" c="dimmed" mb="md">
                  Manage the payment methods available in transaction logs and filter panels.
                </Text>

                <Group mb="md">
                  <TextInput
                    id="new-payment-method-input"
                    size="xs"
                    placeholder="e.g. Apple Pay, Chase Sapphire"
                    style={{ flex: 1, maxWidth: 300 }}
                  />
                  <Button
                    size="xs"
                    color="teal"
                    onClick={() => {
                      const input = document.getElementById('new-payment-method-input');
                      const val = input.value.trim();
                      if (val && !settings.paymentMethods.includes(val)) {
                        setSettings({
                          ...settings,
                          paymentMethods: [...settings.paymentMethods, val]
                        });
                        input.value = '';
                      }
                    }}
                  >
                    ADD METHOD
                  </Button>
                </Group>

                <Group gap="xs" wrap="wrap">
                  {settings.paymentMethods.map(m => (
                    <Badge key={m} variant="outline" color="gray" size="md" rightSection={
                      <ActionIcon 
                        variant="transparent" 
                        size="xs" 
                        color="red"
                        onClick={() => {
                          setSettings({
                            ...settings,
                            paymentMethods: settings.paymentMethods.filter(x => x !== m)
                          });
                        }}
                      >
                        <IconX size="0.75rem" />
                      </ActionIcon>
                    }>
                      {m}
                    </Badge>
                  ))}
                </Group>
              </Paper>

              {/* Spending Categories Manager */}
              <Paper p="md" withBorder style={{ backgroundColor: '#1E1E24', borderColor: '#2E2E33' }}>
                <Group gap="xs" mb="xs">
                  <ThemeIcon variant="light" color="orange" size="sm">
                    <IconTarget size="1rem" />
                  </ThemeIcon>
                  <Title order={4}>Spending Categories</Title>
                </Group>
                <Text size="xs" c="dimmed" mb="md">
                  Manage custom categories available for transaction logging, budget goals, and necessity ratings.
                </Text>

                <Group mb="md">
                  <TextInput
                    id="new-category-input"
                    size="xs"
                    placeholder="e.g. Coffee & Snacks, Pet Care"
                    style={{ flex: 1, maxWidth: 300 }}
                  />
                  <Button
                    size="xs"
                    color="orange"
                    onClick={() => {
                      const input = document.getElementById('new-category-input');
                      const val = input.value.trim();
                      const currentCats = settings.customCategories || Object.keys(CATEGORY_COLORS);
                      if (val && !currentCats.includes(val)) {
                        setSettings({
                          ...settings,
                          customCategories: [...currentCats, val]
                        });
                        input.value = '';
                      }
                    }}
                  >
                    ADD CATEGORY
                  </Button>
                </Group>

                <Group gap="xs" wrap="wrap">
                  {(settings.customCategories || Object.keys(CATEGORY_COLORS)).map(c => (
                    <Badge 
                      key={c} 
                      variant="outline" 
                      color="gray" 
                      size="md" 
                      leftSection={
                        <Box style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: getCategoryColor(c), marginRight: 4 }} />
                      }
                      rightSection={
                        <ActionIcon 
                          variant="transparent" 
                          size="xs" 
                          color="red"
                          onClick={() => {
                            const currentCats = settings.customCategories || Object.keys(CATEGORY_COLORS);
                            setSettings({
                              ...settings,
                              customCategories: currentCats.filter(x => x !== c)
                            });
                          }}
                        >
                          <IconX size="0.75rem" />
                        </ActionIcon>
                      }
                    >
                      {c}
                    </Badge>
                  ))}
                </Group>
              </Paper>

              {/* Income & Math Settings */}
              <Paper p="md" withBorder style={{ backgroundColor: '#1E1E24', borderColor: '#2E2E33' }}>
                <Title order={4} mb="xs">Income & Baseline Settings</Title>
                <Grid>
                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <NumberInput
                      label="Manual Monthly Income Baseline Target"
                      prefix="$"
                      value={settings.manualIncome}
                      onChange={val => setSettings({...settings, manualIncome: String(val || 0)})}
                    />
                    <Text size="xs" c="dimmed" mt={4}>
                      Used for baseline cashflow analysis when no explicit income transactions are entered.
                    </Text>
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <Checkbox
                      mt="xl"
                      label="Enable Charitable Giving / Tithing Inference Mode"
                      checked={settings.tithingEnabled}
                      onChange={e => setSettings({...settings, tithingEnabled: e.currentTarget.checked})}
                    />
                    <Text size="xs" c="dimmed" mt={4}>
                      Infers gross and take-home income mathematically based on a 10% tithing or giving principle.
                    </Text>
                  </Grid.Col>
                </Grid>
              </Paper>

              {/* Sample Data & Database Management */}
              <Paper p="md" withBorder style={{ backgroundColor: '#1E1E24', borderColor: '#2E2E33' }}>
                <Title order={4} mb="xs">Data Management & Full Backups</Title>
                <Text size="xs" c="dimmed" mb="md">
                  Export or restore your complete budget, including all custom household members, card names, custom categories, budget goals, subscriptions, assets, and transactions.
                </Text>
                
                <Paper p="sm" mb="md" withBorder style={{ backgroundColor: '#141416', borderColor: '#27272A' }}>
                  <Text fw={700} size="xs" c="teal.4" mb={4}>COMPLETE BACKUP &amp; RESTORE (DATA + CONFIGS)</Text>
                  <Text size="xs" c="dimmed" mb="sm">
                    Downloads a single JSON file with all your personalized settings and transaction records. Perfect for moving your data between devices or keeping safe offline snapshots.
                  </Text>
                  <Group wrap="wrap" gap="xs">
                    <Button 
                      variant="filled" 
                      color="teal" 
                      size="sm" 
                      leftSection={<IconDownload size="1rem" />}
                      onClick={handleExportJSON}
                    >
                      EXPORT ALL DATA &amp; SETTINGS (.JSON)
                    </Button>
                    <Button 
                      variant="outline" 
                      color="cyan" 
                      size="sm" 
                      leftSection={<IconUpload size="1rem" />}
                      onClick={() => document.getElementById('settings-json-import').click()}
                    >
                      RESTORE ALL DATA &amp; SETTINGS (.JSON)
                    </Button>
                    <input
                      type="file"
                      id="settings-json-import"
                      style={{ display: 'none' }}
                      accept=".json"
                      onChange={handleImportJSON}
                    />
                  </Group>
                </Paper>

                <Group wrap="wrap">
                  <Button 
                    color="teal" 
                    size="sm" 
                    variant="light"
                    leftSection={<IconDatabase size="1rem" />}
                    onClick={handleSeedDemoData}
                  >
                    LOAD DEMO DATA
                  </Button>
                  <Button 
                    variant="subtle" 
                    color="gray" 
                    size="sm" 
                    leftSection={<IconDownload size="1rem" />}
                    onClick={handleExportCSV}
                  >
                    EXPORT CSV
                  </Button>
                  <Button 
                    variant="subtle" 
                    color="gray" 
                    size="sm" 
                    leftSection={<IconUpload size="1rem" />}
                    onClick={() => document.getElementById('settings-csv-import').click()}
                  >
                    IMPORT CSV
                  </Button>
                  <input
                    type="file"
                    id="settings-csv-import"
                    style={{ display: 'none' }}
                    accept=".csv"
                    onChange={handleImportCSV}
                  />
                  <Button 
                    variant="subtle" 
                    color="red" 
                    size="sm" 
                    leftSection={<IconTrash size="1rem" />}
                    onClick={handleResetData}
                  >
                    CLEAR ALL DATA
                  </Button>
                </Group>
              </Paper>

              {/* Comprehensive Financial Calculation & Math Guide */}
              <Paper p="md" withBorder style={{ backgroundColor: '#1E1E24', borderColor: '#2E2E33' }}>
                <Group justify="space-between" align="center" mb="xs">
                  <Title order={4} style={{ color: ACCENT_COLOR }}>Financial Calculation & Math Guide</Title>
                  <Badge color="teal" variant="light">Documentation</Badge>
                </Group>
                <Text size="xs" c="dimmed" mb="md">
                  Transparent breakdown of how BudgetStar calculates pacing, monthly averages, and budget limits.
                </Text>

                <Stack gap="md">
                  <Paper p="xs" withBorder style={{ backgroundColor: '#141416', borderColor: '#27272A' }}>
                    <Text fw={700} size="xs" c="teal.4">1. Variable Spending Baseline (B)</Text>
                    <Code block mt={4} style={{ backgroundColor: '#09090B', color: '#A7F3D0', fontSize: '0.75rem' }}>
                      {`Baseline = (Month₁ + Month₂ + Month₃ Variable Spend) / 3\n* Excludes fixed Living/Utilities bills to prevent lump-sum pacing spikes`}
                    </Code>
                    <Text size="xs" c="dimmed" mt={4}>
                      Historical average discretionary spend across past 3 complete calendar months.
                    </Text>
                  </Paper>

                  <Paper p="xs" withBorder style={{ backgroundColor: '#141416', borderColor: '#27272A' }}>
                    <Text fw={700} size="xs" c="teal.4">2. Daily Pace Limit & Target</Text>
                    <Code block mt={4} style={{ backgroundColor: '#09090B', color: '#A7F3D0', fontSize: '0.75rem' }}>
                      {`Daily Budget Target = Baseline / Total Days in Month\nRemaining Daily Limit = max(0, Baseline - Month-to-Date Variable Spend) / Remaining Days`}
                    </Code>
                    <Text size="xs" c="dimmed" mt={4}>
                      Provides an actionable daily spending ceiling for the remainder of the calendar month.
                    </Text>
                  </Paper>

                  <Paper p="xs" withBorder style={{ backgroundColor: '#141416', borderColor: '#27272A' }}>
                    <Text fw={700} size="xs" c="teal.4">3. Battery Budget Goals</Text>
                    <Code block mt={4} style={{ backgroundColor: '#09090B', color: '#A7F3D0', fontSize: '0.75rem' }}>
                      {`Battery % = max(0, 100 - (Current Spend / Budget Target) * 100)`}
                    </Code>
                    <Text size="xs" c="dimmed" mt={4}>
                      Starts at 100% on the 1st of the month and shifts color (Green → Lime → Yellow → Orange → Red) as funds deplete.
                    </Text>
                  </Paper>
                </Stack>
              </Paper>
            </Stack>
          )}

          {/* VIEW: ABOUT & SERPILAS RULES */}
          {view === 'info' && (
            <Stack gap="xl">
              <Paper p="xl" withBorder style={{ backgroundColor: '#1E1E24', borderColor: '#2E2E33' }}>
                <Group justify="space-between" align="center" mb="md" wrap="wrap">
                  <div>
                    <Title order={3} style={{ color: ACCENT_COLOR, letterSpacing: '-0.5px' }}>About BudgetStar</Title>
                    <Text size="sm" c="dimmed">Minimalist, distraction-free personal finance tracker.</Text>
                  </div>
                  <Group gap="xs">
                    <Badge color="teal" size="lg" variant="light">v2.0.0 Open Source</Badge>
                    <Button
                      component="a"
                      href="https://github.com/elricclark1/BudgetStar"
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="outline"
                      color="gray"
                      size="xs"
                      leftSection={<IconBrandGithub size="1rem" />}
                    >
                      VIEW ON GITHUB
                    </Button>
                  </Group>
                </Group>

                <Text size="sm" mb="lg" style={{ lineHeight: 1.7 }}>
                  BudgetStar is an independent digital workshop application built by Elric. Designed for self-hosters and families who value distraction-free utility, high legibility, and full ownership of their data.
                </Text>

                <Divider my="md" color="#27272A" />

                <Title order={4} mb="xs">Core Principles:</Title>
                <Stack gap="sm" mb="xl">
                  <Paper p="sm" withBorder style={{ backgroundColor: '#141416', borderColor: '#27272A' }}>
                    <Text fw={700} size="sm" c="teal.4">1. Ad-Free Experience</Text>
                    <Text size="xs" c="dimmed">
                      Clean, tracker-free web applications engineered purely for utility, performance, and user satisfaction without invasive telemetry or crowding advertisements.
                    </Text>
                  </Paper>
                  <Paper p="sm" withBorder style={{ backgroundColor: '#141416', borderColor: '#27272A' }}>
                    <Text fw={700} size="sm" c="teal.4">2. Transparent & Open Source</Text>
                    <Text size="xs" c="dimmed">
                      Public code built in the open. Anyone can inspect how it works, see what happens under the hood, or host it themselves. We want our tools to be useful and customizable to you.
                    </Text>
                  </Paper>
                  <Paper p="sm" withBorder style={{ backgroundColor: '#141416', borderColor: '#27272A' }}>
                    <Text fw={700} size="sm" c="teal.4">3. No Accounts Required</Text>
                    <Text size="xs" c="dimmed">
                      Instant access to every tool without forced accounts or remembering passwords. Data is persisted directly in your local SQLite database or your browser's private local storage.
                    </Text>
                  </Paper>
                  <Paper p="sm" withBorder style={{ backgroundColor: '#141416', borderColor: '#27272A' }}>
                    <Text fw={700} size="sm" c="teal.4">4. Zero Data Selling or Tracking</Text>
                    <Text size="xs" c="dimmed">
                      User activity stays strictly theirs. Nothing is tracked, packaged for advertising profiles, or sold to third-party data brokers.
                    </Text>
                  </Paper>
                </Stack>

                <Divider my="md" color="#27272A" />

                <Title order={4} mb="xs">Operational Transparency</Title>
                <Text size="xs" c="dimmed" mb="xl" style={{ lineHeight: 1.6 }}>
                  BudgetStar is vibe-coded with AI assistance, thoroughly human-tested, and self-hosted on real bare-metal hardware. AI automation enables solo builders to craft durable, high-quality, completely free tools without ads, venture capital, or paywalls.
                </Text>

                <Title order={4} mb="xs">Version History</Title>
                <Stack gap="xs">
                  <Paper p="xs" withBorder style={{ backgroundColor: '#141416', borderColor: '#27272A' }}>
                    <Group justify="space-between">
                      <Text fw={700} size="xs">v2.0.0</Text>
                      <Text size="xs" c="dimmed">Current Release</Text>
                    </Group>
                    <Text size="xs" c="dimmed" mt={2}>
                      Complete generic open-source overhaul. Dynamic household profiles, custom payment methods, multi-category battery goals, real-time search, cashflow analysis, and one-click demo data.
                    </Text>
                  </Paper>
                  <Paper p="xs" withBorder style={{ backgroundColor: '#141416', borderColor: '#27272A' }}>
                    <Group justify="space-between">
                      <Text fw={700} size="xs">v1.5</Text>
                      <Text size="xs" c="dimmed">September 2026</Text>
                    </Group>
                    <Text size="xs" c="dimmed" mt={2}>
                      Added multi-category goals, category necessity matrix, battery color progression, and charge date tracking.
                    </Text>
                  </Paper>
                  <Paper p="xs" withBorder style={{ backgroundColor: '#141416', borderColor: '#27272A' }}>
                    <Group justify="space-between">
                      <Text fw={700} size="xs">v1.4</Text>
                      <Text size="xs" c="dimmed">August 2026</Text>
                    </Group>
                    <Text size="xs" c="dimmed" mt={2}>
                      Variable spending isolation from fixed living bills, keyword search in purchase log, and mobile drawer filtering.
                    </Text>
                  </Paper>
                </Stack>
              </Paper>
            </Stack>
          )}

        </Container>
      </AppShell.Main>
    </AppShell>
  );
}