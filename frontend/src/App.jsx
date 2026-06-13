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
  SegmentedControl
} from '@mantine/core'
import { DateInput } from '@mantine/dates'
import { useDisclosure } from '@mantine/hooks'
import { IconPlus, IconDashboard, IconList, IconSettings, IconDatabase, IconChevronDown, IconChevronUp, IconChartHistogram, IconTrash, IconFileDownload, IconTarget, IconRepeat, IconMessageChatbot, IconX, IconSend, IconCar, IconFilter, IconPencil, IconInfoCircle, IconCoin, IconReportMoney, IconCalculator, IconPigMoney, IconUpload, IconDownload } from '@tabler/icons-react'
import axios from 'axios'
import dayjs from 'dayjs'
import 'dayjs/locale/en'
import isBetween from 'dayjs/plugin/isBetween'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LabelList, ReferenceLine, ScatterChart, Scatter, ZAxis, ErrorBar, AreaChart, Area } from 'recharts'

dayjs.extend(isBetween)
dayjs.extend(customParseFormat)

const CATEGORY_COLORS = {
  'Groceries': '#10B981', // Green
  'Subscription': '#B91C1C', // Deep Red
  'Eat out': '#F59E0B', // Orange
  'Fuel': '#FBBF24', // Amber
  'Living/Utilities': '#3B82F6', // Blue
  'Fun': '#8B5CF6', // Purple
  'Tithing': '#6366F1', // Indigo
  'Clothing': '#EC4899', // Pink
  'Education': '#14B8A6', // Teal
  'Transportation': '#06B6D4', // Cyan
  'Gift': '#84CC16', // Lime
  'Product': '#A78BFA', // Violet
  'Fee': '#71717A', // Zinc
  'Other': '#6B7280', // Gray
  'Health': '#EF4444', // Red
  'Personal Care': '#F472B6' // Pink
};

const getCategoryColor = (cat) => CATEGORY_COLORS[cat] || '#6B7280';

const ACCENT_COLOR = "#2DD4BF"; // Aquamarine

const METHOD_COLORS = {
  'Cash': 'green',
  'Rogue Debit': 'blue',
  'Rogue Debit Card': 'blue',
  'Rogue + Venmo': 'blue', 
  'Capital One Credit': 'gray',
  'Capital One Credit Card': 'gray',
  'Discover Credit': 'orange',
  'Discover Credit Card': 'orange',
  'US Bank': 'violet',
  'Dash Debit': 'red',
  'Transfer': 'cyan',
  'Venmo': 'teal',
  'Other': 'gray'
};

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }) => {
  const isSmall = percent < 0.05;
  const radius = innerRadius + (outerRadius - innerRadius) * (isSmall ? 1.4 : 0.5);
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  // Calculate line points for small slices
  const lineStartRadius = outerRadius;
  const lineEndRadius = outerRadius * 1.2;
  const lx1 = cx + lineStartRadius * Math.cos(-midAngle * RADIAN);
  const ly1 = cy + lineStartRadius * Math.sin(-midAngle * RADIAN);
  const lx2 = cx + lineEndRadius * Math.cos(-midAngle * RADIAN);
  const ly2 = cy + lineEndRadius * Math.sin(-midAngle * RADIAN);

  // Resolve color dynamically based on whether it is a category or a necessity scale value
  const necessityColors = { 1: '#F87171', 2: '#FB923C', 3: '#FACC15', 4: '#4ADE80', 5: '#22C55E' };
  const labelColor = necessityColors[name] || getCategoryColor(name);

  if (isSmall) {
      return (
        <g>
            <path d={`M${lx1},${ly1}L${lx2},${ly2}`} stroke={labelColor} fill="none"/>
            <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={12}>
            {`${(percent * 100).toFixed(0)}%`}
            </text>
        </g>
      );
  }

  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontWeight="bold">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const CustomMonthlyTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const gross = data.GrossIncome;
    const net = data.NetIncome;
    const spend = data.TotalSpending;
    const tithing = data.Tithing;
    const livingSpend = spend - tithing;
    const spendingRatio = net > 0 ? (livingSpend / net) * 100 : 0;
    
    return (
      <Paper p="sm" withBorder style={{ backgroundColor: '#1E1E1E', borderColor: '#333333', color: '#FFFFFF' }}>
        <Text fw={700} mb="xs" size="sm">{label}</Text>
        <Stack gap={4}>
          <Group justify="space-between" gap="lg">
            <Text size="xs" c="dimmed">Gross Income:</Text>
            <Text size="xs" fw={600} c="teal.4">${gross.toLocaleString(undefined, {minimumFractionDigits: 2})}</Text>
          </Group>
          <Group justify="space-between" gap="lg">
            <Text size="xs" c="dimmed">Tithing Paid:</Text>
            <Text size="xs" fw={600} c="#6366F1">${tithing.toLocaleString(undefined, {minimumFractionDigits: 2})}</Text>
          </Group>
          <Group justify="space-between" gap="lg">
            <Text size="xs" c="dimmed">Net Income:</Text>
            <Text size="xs" fw={600} c="blue.4">${net.toLocaleString(undefined, {minimumFractionDigits: 2})}</Text>
          </Group>
          <Group justify="space-between" gap="lg">
            <Text size="xs" c="dimmed">Living Spending:</Text>
            <Text size="xs" fw={600} c="orange.4">${livingSpend.toLocaleString(undefined, {minimumFractionDigits: 2})}</Text>
          </Group>
          <Group justify="space-between" gap="lg">
            <Text size="xs" c="dimmed">Total Spending:</Text>
            <Text size="xs" fw={600} c="red.4">${spend.toLocaleString(undefined, {minimumFractionDigits: 2})}</Text>
          </Group>
          <Divider my={4} color="#333333" />
          <Group justify="space-between" gap="lg">
            <Text size="xs" fw={700}>Spend / Net Income Ratio:</Text>
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

function App() {
  const [transactions, setTransactions] = useState([])
  const [goals, setGoals] = useState([])
  const [recurrings, setRecurrings] = useState([])
  const [assets, setAssets] = useState([])
  const [view, setView] = useState('dashboard') // 'dashboard', 'log', 'trends', 'goals', 'data', 'assets', 'settings'
  const [categoryChartView, setCategoryChartView] = useState('pie') // 'pie' or 'ranking'
  const [opened, { toggle: toggleForm }] = useDisclosure(false)
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure(false)
  const [filtersOpened, { toggle: toggleFilters, close: closeFilters }] = useDisclosure(false)
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [editingId, setEditingId] = useState(null);

  // Standalone and Settings state
  const [isStandalone, setIsStandalone] = useState(
    window.location.hostname === 'budgetstar.serpilas.com' ||
    import.meta.env.VITE_STANDALONE === 'true'
  );
  
  const [settings, setSettings] = useState(() => {
    const defaultSettings = {
      tithingEnabled: false,
      savingsEnabled: true,
      manualIncome: '3000',
      paymentMethods: ['Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Venmo']
    };
    try {
      const saved = localStorage.getItem('budgetstar_settings');
      if (saved) return { ...defaultSettings, ...JSON.parse(saved) };
    } catch (e) {
      console.error("Failed to load settings:", e);
    }
    return defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem('budgetstar_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    if (view === 'income-tithing' && !settings.tithingEnabled) {
      setView('dashboard');
    }
    if (view === 'savings' && !settings.savingsEnabled) {
      setView('dashboard');
    }
  }, [view, settings.tithingEnabled, settings.savingsEnabled]);

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
  
  // Assets state
  const [assetForm, setAssetForm] = useState({
    name: '',
    purchase_date: new Date(),
    purchase_price: '',
    estimated_value: '',
    description: '',
    updated_at: new Date()
  })
  const [editingAsset, setEditingAsset] = useState(null)
  // Trends state
  const [showTrendsChart, setShowTrendsChart] = useState(true)
  const [customComparisonValue, setCustomComparisonValue] = useState(1)
  const [customComparisonUnit, setCustomComparisonUnit] = useState('month')
  const [customPeriodValue, setCustomPeriodValue] = useState(1)
  const [customPeriodUnit, setCustomPeriodUnit] = useState('month')
  const [comparisonPeriod, setComparisonPeriod] = useState('All Time') // For Trends view

  // Scenario planner state
  const [plannerGrossIncome, setPlannerGrossIncome] = useState('')
  const [plannerTithing, setPlannerTithing] = useState('')

  // Filters
  const [period, setPeriod] = useState('All Time')
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  
  const PERIOD_OPTIONS = [
    'All Time', 
    'Custom Range',
    'Last 14 Days', 'Last 30 Days', 'Last 90 Days', 'Last 180 Days',
    'This Month', 'Last Month', 
    'This Quarter', 'Last Quarter',
    'This Year'
  ];

  // Helper to filter transactions by a specific period string
  const getFilteredTransactions = (baseTransactions, periodStr, arg1 = null, arg2 = null) => {
    const now = dayjs();
    let start, end;
    if (periodStr === 'All Time') return baseTransactions;

    if (periodStr === 'Custom Range' && arg1) {
        start = dayjs(arg1).startOf('day');
        if (arg2) end = dayjs(arg2).endOf('day');
    }
    else if (periodStr === 'Custom' && arg1 && arg2) {
        start = now.subtract(arg1, arg2).startOf(arg2);
    }
    else if (periodStr === 'Last 14 Days') start = now.subtract(14, 'day')
    else if (periodStr === 'Last 30 Days') start = now.subtract(30, 'day')
    else if (periodStr === 'Last 90 Days') start = now.subtract(90, 'day')
    else if (periodStr === 'Last 180 Days') start = now.subtract(180, 'day')
    else if (periodStr === 'This Month') start = now.startOf('month')
    else if (periodStr === 'Last Month') {
        start = now.subtract(1, 'month').startOf('month');
        end = now.subtract(1, 'month').endOf('month');
    }
    else if (periodStr === 'This Quarter') start = now.startOf('quarter')
    else if (periodStr === 'Last Quarter') {
        start = now.subtract(1, 'quarter').startOf('quarter');
        end = now.subtract(1, 'quarter').endOf('quarter');
    }
    else if (periodStr === 'This Year') start = now.startOf('year')
    
    if (start) {
      return baseTransactions.filter(t => {
          const d = dayjs(t.date);
          if (end) return (d.isAfter(start) || d.isSame(start)) && (d.isBefore(end) || d.isSame(end));
          return d.isAfter(start) || d.isSame(start);
      })
    }
    return baseTransactions;
  };
  
  // Form state
  const [form, setForm] = useState({
    date: new Date(),
    description: '',
    amount: '',
    necessity: 3,
    method: 'Cash',
    category: 'Groceries',
    tag: '',
    notes: '',
    is_reimbursed: false,
    reimbursement_amount: ''
  })

  // Goal Form state
  const [goalForm, setGoalForm] = useState({
    category: 'Groceries',
    amount: 100,
    period: 'month'
  })

  // Recurring Form state
  const [recurringForm, setRecurringForm] = useState({
    name: '',
    category: 'Subscription',
    amount: 10,
    period: 'month'
  })

  // Savings state
  const [savings, setSavings] = useState([])
  const [savingsAccounts, setSavingsAccounts] = useState([])
  const [newAccountName, setNewAccountName] = useState('')
  const [savingForm, setSavingForm] = useState({
    date: new Date(),
    amount: '',
    notes: '',
    account_name: 'Cash'
  })
  const [editingSaving, setEditingSaving] = useState(null)

  useEffect(() => {
    fetchTransactions()
    fetchGoals()
    fetchRecurrings()
    fetchAssets()
    fetchSavings()
    fetchSavingsAccounts()
  }, [])

  const fetchTransactions = async () => {
    if (isStandalone) {
      const data = getLocalData('budgetstar_transactions');
      setTransactions(data);
      initializeFilters(data);
      return;
    }
    try {
      const baseUrl = import.meta.env.BASE_URL.replace(/\/$/, '');
      const response = await axios.get(`${baseUrl}/api/transactions/?limit=5000`);
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
  }

  const initializeFilters = (data) => {
    if (selectedCategories.length === 0) {
      const dbCats = data.map(t => t.category);
      const staticCats = Object.keys(CATEGORY_COLORS);
      const cats = [...new Set([...dbCats, ...staticCats])];
      setSelectedCategories(cats.filter(c => c !== 'Tithing'));
    }
    const methods = [...new Set(data.map(t => t.method))];
    if (selectedMethods.length === 0) setSelectedMethods(methods);
  }

  const fetchGoals = async () => {
    if (isStandalone) {
      setGoals(getLocalData('budgetstar_goals'));
      return;
    }
    try {
      const baseUrl = import.meta.env.BASE_URL.replace(/\/$/, '');
      const response = await axios.get(`${baseUrl}/api/goals/`);
      setGoals(response.data);
      setLocalData('budgetstar_goals', response.data);
    } catch (error) {
      console.warn("Backend error fetching goals, falling back to local storage:", error);
      setIsStandalone(true);
      setGoals(getLocalData('budgetstar_goals'));
    }
  }

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
  }

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
  }

  const handleAssetSubmit = async () => {
    if (!assetForm.name) return;
    try {
      const payload = {
        name: assetForm.name,
        purchase_date: dayjs(assetForm.purchase_date).format('YYYY-MM-DD'),
        updated_at: dayjs(assetForm.updated_at).format('YYYY-MM-DD'),
        purchase_price: parseFloat(assetForm.purchase_price) || 0,
        estimated_value: parseFloat(assetForm.estimated_value) || 0,
        description: assetForm.description || ''
      };

      await performSave('assets', 'budgetstar_assets', payload, editingAsset?.id, !!editingAsset);
      
      setAssetForm({
        name: '',
        purchase_date: new Date(),
        purchase_price: '',
        estimated_value: '',
        description: '',
        updated_at: new Date()
      });
      setEditingAsset(null);
      fetchAssets();
    } catch (error) {
      console.error("Error saving asset:", error);
    }
  }

  const handleDeleteAsset = async (id) => {
    if (confirm('Are you sure you want to delete this asset?')) {
        try {
            await performDelete('assets', 'budgetstar_assets', id);
            fetchAssets();
        } catch (error) {
            console.error("Error deleting asset:", error);
        }
    }
  }

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
      console.warn("Backend error fetching savings, falling back to local storage:", error);
      setIsStandalone(true);
      setSavings(getLocalData('budgetstar_savings'));
    }
  }

  const handleSavingSubmit = async () => {
    if (!savingForm.amount || isNaN(parseFloat(savingForm.amount))) {
      alert("Please enter a valid amount.");
      return;
    }
    if (!savingForm.date) {
      alert("Please select a date.");
      return;
    }

    try {
      const payload = {
        date: dayjs(savingForm.date).format('YYYY-MM-DD'),
        amount: parseFloat(savingForm.amount),
        notes: savingForm.notes || '',
        user: 'Elric',
        account_name: savingForm.account_name || 'Cash'
      };

      await performSave('savings', 'budgetstar_savings', payload, editingSaving?.id, !!editingSaving);
      setEditingSaving(null);

      setSavingForm({
        date: new Date(),
        amount: '',
        notes: '',
        account_name: 'Cash'
      });
      fetchSavings();
    } catch (error) {
      console.error("Error saving savings entry:", error);
      alert("Failed to save savings entry: " + error.message);
    }
  }

  const handleDeleteSaving = async (id) => {
    if (confirm('Are you sure you want to delete this savings entry?')) {
      try {
        await performDelete('savings', 'budgetstar_savings', id);
        fetchSavings();
      } catch (error) {
        console.error("Error deleting savings entry:", error);
      }
    }
  }

  const fetchSavingsAccounts = async () => {
    if (isStandalone) {
      const accounts = getLocalData('budgetstar_savings_accounts');
      if (accounts.length === 0) {
        const defaults = ["Cash", "Savings Account"];
        const formatted = defaults.map((d, i) => ({ id: i + 1, name: d }));
        setLocalData('budgetstar_savings_accounts', formatted);
        setSavingsAccounts(formatted);
      } else {
        setSavingsAccounts(accounts);
      }
      return;
    }
    try {
      const baseUrl = import.meta.env.BASE_URL.replace(/\/$/, '');
      const response = await axios.get(`${baseUrl}/api/savings-accounts/`);
      setSavingsAccounts(response.data);
      setLocalData('budgetstar_savings_accounts', response.data);
    } catch (error) {
      console.warn("Backend error fetching savings accounts, falling back to local storage:", error);
      setIsStandalone(true);
      const accounts = getLocalData('budgetstar_savings_accounts');
      setSavingsAccounts(accounts);
    }
  }

  const handleCreateAccount = async () => {
    if (!newAccountName || !newAccountName.trim()) return;
    try {
      await performSave('savings-accounts', 'budgetstar_savings_accounts', { name: newAccountName.trim(), user: 'Elric' });
      setNewAccountName('');
      fetchSavingsAccounts();
    } catch (error) {
      console.error("Error creating savings account:", error);
      alert("Failed to create savings account: " + error.message);
    }
  }

  const handleDeleteAccount = async (id) => {
    if (confirm("Are you sure you want to remove this savings account? This will not delete any associated savings records, but the account will no longer be listed.")) {
      try {
        await performDelete('savings-accounts', 'budgetstar_savings_accounts', id);
        fetchSavingsAccounts();
      } catch (error) {
        console.error("Error deleting savings account:", error);
      }
    }
  }

  const handleAddRecurring = async (suggestion) => {
      try {
        await performSave('recurrings', 'budgetstar_recurrings', suggestion);
        fetchRecurrings();
      } catch(e) { console.error("Error saving recurring:", e); }
  };
  
  const handleDeleteRecurring = async (id) => {
      try {
        await performDelete('recurrings', 'budgetstar_recurrings', id);
        fetchRecurrings();
      } catch(e) { console.error("Error deleting recurring:", e); }
  };

  const suggestedRecurrings = useMemo(() => {
    // Find descriptions that appear at least 2 times and look like a recurring sub.
    const recentTx = transactions.filter(t => dayjs(t.date).isAfter(dayjs().subtract(6, 'month')));
    const counts = {};
    recentTx.forEach(t => {
       const key = `${t.description}||${t.amount}||${t.category}`;
       counts[key] = (counts[key] || 0) + 1;
    });

    const suggestions = [];
    Object.keys(counts).forEach(key => {
        if (counts[key] >= 2) {
            const [desc, amount, cat] = key.split('||');
            // ensure it's not already in recurrings
            const exists = recurrings.some(r => r.name.toLowerCase() === desc.toLowerCase());
            if (!exists) {
                suggestions.push({
                    name: desc,
                    amount: parseFloat(amount),
                    category: cat,
                    period: 'month' // default
                });
            }
        }
    });
    return suggestions;
  }, [transactions, recurrings]);

  const handleGoalSubmit = async () => {
    try {
      await performSave('goals', 'budgetstar_goals', {
        ...goalForm,
        user: 'Elric',
        amount: parseFloat(goalForm.amount)
      });
      setGoalForm({ category: allCategories[0] || 'Groceries', amount: 100, period: 'month' });
      fetchGoals();
    } catch (error) {
      console.error("Error saving goal:", error)
    }
  }

  const handleRecurringSubmit = async () => {
    if (!recurringForm.name) return;
    try {
      await performSave('recurrings', 'budgetstar_recurrings', {
        ...recurringForm,
        amount: parseFloat(recurringForm.amount)
      });
      setRecurringForm({ name: '', category: 'Subscription', amount: 10, period: 'month' })
      fetchRecurrings()
    } catch (error) {
      console.error("Error saving recurring:", error)
    }
  }

  const handleGoalDelete = async (id) => {
    if (confirm('Are you sure you want to delete this goal?')) {
        try {
            await performDelete('goals', 'budgetstar_goals', id);
            fetchGoals();
        } catch (error) {
            console.error("Error deleting goal:", error);
        }
    }
  }

  const FilterContent = ({ isMobile = false }) => (
    <Stack gap="xs">
      {!isMobile && (
        <>
          <NavLink
            label="Dashboard"
            leftSection={<IconDashboard size="1rem" />}
            active={view === 'dashboard'}
            onClick={() => setView('dashboard')}
            styles={{ label: { fontWeight: 600 } }}
          />
           <NavLink
            label="Averages & Trends"
            leftSection={<IconChartHistogram size="1rem" />}
            active={view === 'trends'}
            onClick={() => setView('trends')}
            styles={{ label: { fontWeight: 600 } }}
          />
          {settings.tithingEnabled && (
            <NavLink
              label="Income & Tithing"
              leftSection={<IconReportMoney size="1rem" />}
              active={view === 'income-tithing'}
              onClick={() => setView('income-tithing')}
              styles={{ label: { fontWeight: 600 } }}
            />
          )}
          <NavLink
            label="Log / Edit"
            leftSection={<IconList size="1rem" />}
            active={view === 'log'}
            onClick={() => setView('log')}
            styles={{ label: { fontWeight: 600 } }}
          />
          <NavLink
            label="Goals"
            leftSection={<IconTarget size="1rem" />}
            active={view === 'goals'}
            onClick={() => setView('goals')}
            styles={{ label: { fontWeight: 600 } }}
          />
          <NavLink
            label="Recurring Purchases"
            leftSection={<IconRepeat size="1rem" />}
            active={view === 'recurrings'}
            onClick={() => setView('recurrings')}
            styles={{ label: { fontWeight: 600 } }}
          />
          <NavLink
            label="Assets"
            leftSection={<IconCar size="1rem" />}
            active={view === 'assets'}
            onClick={() => setView('assets')}
            styles={{ label: { fontWeight: 600 } }}
          />
          {settings.savingsEnabled && (
            <NavLink
              label="Savings"
              leftSection={<IconPigMoney size="1rem" />}
              active={view === 'savings'}
              onClick={() => setView('savings')}
              styles={{ label: { fontWeight: 600 } }}
            />
          )}
          <NavLink
            label="Settings"
            leftSection={<IconSettings size="1rem" />}
            active={view === 'settings'}
            onClick={() => setView('settings')}
            styles={{ label: { fontWeight: 600 } }}
          />
          <NavLink
            label="Info & Help"
            leftSection={<IconInfoCircle size="1rem" />}
            active={view === 'info'}
            onClick={() => setView('info')}
            styles={{ label: { fontWeight: 600 } }}
          />
          <Divider my="sm" color="#222222" />
        </>
      )}

      <Text size="sm" fw={700} c="dimmed" mb={4}>PERIOD</Text>
      <Select
        value={period}
        onChange={setPeriod}
        data={PERIOD_OPTIONS}
        variant="filled"
        styles={{ input: { backgroundColor: '#1E1E1E', border: '1px solid #333333' } }}
      />
      {period === 'Custom Range' && (
        <Stack gap="xs" mt="xs">
            <DateInput firstDayOfWeek={0}
                value={startDate}
                onChange={setStartDate}
                placeholder="Start Date"
                styles={{ input: { backgroundColor: '#1E1E1E', border: '1px solid #333333' } }}
            />
            <DateInput firstDayOfWeek={0}
                value={endDate}
                onChange={setEndDate}
                placeholder="End Date"
                styles={{ input: { backgroundColor: '#1E1E1E', border: '1px solid #333333' } }}
            />
        </Stack>
      )}

      <Text size="sm" fw={700} c="dimmed" mt="md" mb={4}>CATEGORIES</Text>
      <Group gap="xs" mb="xs">
        <Button size="compact-xs" variant="light" onClick={() => setSelectedCategories(allCategories)}>All</Button>
        <Button size="compact-xs" variant="light" onClick={() => setSelectedCategories([])}>None</Button>
      </Group>
      <ScrollArea mah={isMobile ? 400 : 500} offsetScrollbars style={{ border: '1px solid #222', borderRadius: '4px', padding: '8px', backgroundColor: '#050505' }}>
        <SimpleGrid cols={2} spacing="xs">
          {allCategories.map(cat => (
            <Checkbox
              key={cat}
              label={cat}
              checked={selectedCategories.includes(cat)}
              onChange={(event) => {
                if (event.currentTarget.checked) setSelectedCategories([...selectedCategories, cat])
                else setSelectedCategories(selectedCategories.filter(c => c !== cat))
              }}
              styles={{ label: { fontSize: 'var(--mantine-font-size-xs)' } }}
            />
          ))}
        </SimpleGrid>
      </ScrollArea>

      <Text size="sm" fw={700} c="dimmed" mt="xs" mb={4}>METHODS</Text>
      <ScrollArea mah={isMobile ? 150 : 200} offsetScrollbars style={{ border: '1px solid #222', borderRadius: '4px', padding: '8px', backgroundColor: '#050505' }}>
        <Stack gap={4}>
          {allMethods.map(method => (
            <Checkbox
              key={method}
              label={method}
              checked={selectedMethods.includes(method)}
              onChange={(event) => {
                if (event.currentTarget.checked) setSelectedMethods([...selectedMethods, method])
                else setSelectedMethods(selectedMethods.filter(c => c !== method))
              }}
              styles={{ label: { fontSize: 'var(--mantine-font-size-sm)' } }}
            />
          ))}
        </Stack>
      </ScrollArea>

      <Divider my="sm" color="#222222" />
    </Stack>
  );

  const allCategories = useMemo(() => {
    const dbCats = transactions.map(t => t.category);
    const staticCats = Object.keys(CATEGORY_COLORS);
    const combined = [...new Set([...dbCats, ...staticCats])];
    return combined.sort();
  }, [transactions])

  const allMethods = useMemo(() => {
    const methods = [...new Set(transactions.map(t => t.method))];
    const staticMethods = settings.paymentMethods || [];
    return [...new Set([...methods, ...staticMethods])].sort();
  }, [transactions, settings.paymentMethods])

  const [selectedCategories, setSelectedCategories] = useState([])
  const [selectedMethods, setSelectedMethods] = useState([])

  const filteredTransactions = useMemo(() => {
    let filtered = getFilteredTransactions(transactions, period, startDate, endDate);

    if (selectedCategories.length > 0) {
      filtered = filtered.filter(t => selectedCategories.includes(t.category))
    }

    if (selectedMethods.length > 0) {
      filtered = filtered.filter(t => selectedMethods.includes(t.method))
    }

    return filtered
  }, [transactions, period, startDate, endDate, selectedCategories, selectedMethods])


  const stats = useMemo(() => {
    const total = filteredTransactions.reduce((acc, t) => acc + (t.amount - (t.reimbursement_amount || 0)), 0)
    const count = filteredTransactions.length
    const avg = count > 0 ? total / count : 0

    // Monthly average
    const months = [...new Set(filteredTransactions.map(t => dayjs(t.date).format('YYYY-MM')))].length
    const monthlyAvg = months > 0 ? total / months : total

    // Spent This Month (Calendar Month - ignores Period filter, respects Category/Method)
    const now = dayjs();
    const thisMonthStr = now.format('YYYY-MM');
    const spentThisMonth = transactions
      .filter(t => {
          const isMonth = dayjs(t.date).format('YYYY-MM') === thisMonthStr;
          const isCat = selectedCategories.length === 0 || selectedCategories.includes(t.category);
          const isMethod = selectedMethods.length === 0 || selectedMethods.includes(t.method);
          return isMonth && isCat && isMethod;
      })
      .reduce((acc, t) => acc + (t.amount - (t.reimbursement_amount || 0)), 0);

    // Calculate average of the past 3 complete months (ignoring Period filter, respecting Category/Method)
    const last3MonthsStr = [
      now.subtract(1, 'month').format('YYYY-MM'),
      now.subtract(2, 'month').format('YYYY-MM'),
      now.subtract(3, 'month').format('YYYY-MM')
    ];
    const last3MonthsSpends = last3MonthsStr.map(mStr => {
      return transactions
        .filter(t => {
          const isMonth = dayjs(t.date).format('YYYY-MM') === mStr;
          const isCat = selectedCategories.length === 0 || selectedCategories.includes(t.category);
          const isMethod = selectedMethods.length === 0 || selectedMethods.includes(t.method);
          return isMonth && isCat && isMethod;
        })
        .reduce((acc, t) => acc + (t.amount - (t.reimbursement_amount || 0)), 0);
    });
    const past3MonthsAvg = last3MonthsSpends.reduce((acc, val) => acc + val, 0) / 3;

    // Calculate pace
    const daysInMonth = now.daysInMonth();
    const dayOfMonth = now.date();
    const targetAtThisPoint = (past3MonthsAvg / daysInMonth) * dayOfMonth;
    const pacePercent = targetAtThisPoint > 0 ? (spentThisMonth / targetAtThisPoint) * 100 : 0;

    // Daily pace based on 3-month avg budget
    const remainingDays = Math.max(1, daysInMonth - dayOfMonth + 1);
    const dailyTarget = past3MonthsAvg / daysInMonth;
    const actualDailyAvg = spentThisMonth / dayOfMonth;
    const maxDailyRemaining = Math.max(0, (past3MonthsAvg - spentThisMonth) / remainingDays);

    return { total, count, avg, monthlyAvg, spentThisMonth, pacePercent, past3MonthsAvg, dailyTarget, actualDailyAvg, maxDailyRemaining }
  }, [filteredTransactions, transactions, selectedCategories, selectedMethods])

  const incomeStats = useMemo(() => {
    let filteredForIncome = getFilteredTransactions(transactions, period, startDate, endDate);
    
    if (selectedMethods.length > 0) {
      filteredForIncome = filteredForIncome.filter(t => selectedMethods.includes(t.method));
    }

    const tithingPaid = settings.tithingEnabled 
      ? filteredForIncome
        .filter(t => t.category && t.category.toLowerCase() === 'tithing')
        .reduce((acc, t) => acc + t.amount, 0)
      : 0;

    let grossIncome, netIncome;
    if (settings.tithingEnabled) {
      grossIncome = tithingPaid * 10;
      netIncome = tithingPaid * 9;
    } else {
      const monthsSet = new Set(filteredForIncome.map(t => dayjs(t.date).format('YYYY-MM')));
      const numMonths = Math.max(1, monthsSet.size);
      netIncome = (parseFloat(settings.manualIncome) || 0) * numMonths;
      grossIncome = netIncome;
    }

    const totalSpent = filteredForIncome
      .filter(t => selectedCategories.length === 0 || selectedCategories.includes(t.category))
      .reduce((acc, t) => acc + (t.amount - (t.reimbursement_amount || 0)), 0);

    const livingSpent = settings.tithingEnabled
      ? filteredForIncome
        .filter(t => !t.category || t.category.toLowerCase() !== 'tithing')
        .filter(t => selectedCategories.length === 0 || selectedCategories.includes(t.category))
        .reduce((acc, t) => acc + (t.amount - (t.reimbursement_amount || 0)), 0)
      : totalSpent;

    const netSavings = netIncome - livingSpent;
    const incomeBase = settings.tithingEnabled ? grossIncome : netIncome;
    const savingsRate = incomeBase > 0 ? (netSavings / incomeBase) * 100 : 0;

    return {
      tithingPaid,
      grossIncome,
      netIncome,
      totalSpent,
      livingSpent,
      netSavings,
      savingsRate
    };
  }, [transactions, period, startDate, endDate, selectedMethods, selectedCategories, settings.tithingEnabled, settings.manualIncome]);

  const monthlyIncomeSpendingData = useMemo(() => {
    const months = {};
    
    let filtered = getFilteredTransactions(transactions, period, startDate, endDate);
    if (selectedMethods.length > 0) {
      filtered = filtered.filter(t => selectedMethods.includes(t.method));
    }

    filtered.forEach(t => {
      const month = dayjs(t.date).format('YYYY-MM');
      if (!months[month]) {
        months[month] = {
          name: dayjs(t.date).format('MMM YYYY'),
          Tithing: 0,
          TotalSpending: 0,
        };
      }
      
      if (settings.tithingEnabled && t.category && t.category.toLowerCase() === 'tithing') {
        months[month].Tithing += t.amount;
      }
      
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(t.category);
      if (matchesCategory) {
        months[month].TotalSpending += (t.amount - (t.reimbursement_amount || 0));
      }
    });
    
    return Object.keys(months)
      .map(key => {
        const m = months[key];
        let gross, net, savings;
        if (settings.tithingEnabled) {
          gross = m.Tithing * 10;
          net = m.Tithing * 9;
          savings = net - (m.TotalSpending - m.Tithing);
        } else {
          net = parseFloat(settings.manualIncome) || 0;
          gross = net;
          savings = net - m.TotalSpending;
        }
        return {
          key,
          name: m.name,
          GrossIncome: parseFloat(gross.toFixed(2)),
          NetIncome: parseFloat(net.toFixed(2)),
          TotalSpending: parseFloat(m.TotalSpending.toFixed(2)),
          Tithing: parseFloat(m.Tithing.toFixed(2)),
          Savings: parseFloat(savings.toFixed(2))
        };
      })
      .sort((a, b) => dayjs(a.key, 'YYYY-MM').unix() - dayjs(b.key, 'YYYY-MM').unix());
  }, [transactions, period, startDate, endDate, selectedMethods, selectedCategories, settings.tithingEnabled, settings.manualIncome]);


  const chartData = useMemo(() => {
    // Pie data
    const catMap = {}
    filteredTransactions.forEach(t => {
      catMap[t.category] = (catMap[t.category] || 0) + (t.amount - (t.reimbursement_amount || 0))
    })
    const pieData = Object.keys(catMap).map(name => ({ name, value: catMap[name] }))

    // Bar data (Monthly)
    const monthMap = {}
    filteredTransactions.forEach(t => {
      const m = dayjs(t.date).format('MMM YYYY')
      monthMap[m] = (monthMap[m] || 0) + (t.amount - (t.reimbursement_amount || 0))
    })
    const barData = Object.keys(monthMap).map(name => ({ name, value: monthMap[name] })).sort((a, b) => dayjs(a.name, 'MMM YYYY').unix() - dayjs(b.name, 'MMM YYYY').unix())

    return { pieData, barData }
  }, [filteredTransactions])

  const rankingData = useMemo(() => {
    const totalSpend = chartData.pieData.reduce((sum, entry) => sum + entry.value, 0)
    if (totalSpend === 0) return []
    return chartData.pieData
      .map(entry => ({
        name: entry.name,
        amount: entry.value,
        value: (entry.value / totalSpend) * 100
      }))
      .sort((a, b) => b.amount - a.amount)
  }, [chartData.pieData])

  const necessityData = useMemo(() => {
    // 1. Distribution
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    filteredTransactions.forEach(t => {
      const score = t.necessity || 3
      counts[score] = (counts[score] || 0) + 1
    })
    const distData = Object.keys(counts).map(score => ({
      name: score,
      value: counts[score]
    }))

    // 2. Consistency Analysis
    const catStats = {}
    filteredTransactions.forEach(t => {
      if (!catStats[t.category]) catStats[t.category] = []
      catStats[t.category].push(t.necessity || 3)
    })

    const consistencyData = Object.keys(catStats).map(cat => {
      const scores = catStats[cat]
      const sum = scores.reduce((a, b) => a + b, 0)
      const mean = sum / scores.length
      const min = Math.min(...scores)
      const max = Math.max(...scores)
      const variance = scores.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / scores.length
      const stdDev = Math.sqrt(variance)

      return {
        category: cat,
        avg: parseFloat(mean.toFixed(2)),
        min,
        max,
        stdDev: parseFloat(stdDev.toFixed(2)),
        count: scores.length,
        isFixed: mean >= 4 && stdDev < 0.7
      }
    }).filter(d => d.count > 0)

    return { distData, consistencyData }
  }, [filteredTransactions])

  const sortedTransactions = useMemo(() => {
    let sortableItems = [...filteredTransactions];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];

        // Handle string comparison nicely
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();

        if (valA < valB) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (valA > valB) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredTransactions, sortConfig]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleEdit = (t) => {
    setForm({
        date: dayjs(t.date).toDate(),
        description: t.description,
        amount: t.amount,
        necessity: t.necessity,
        method: t.method,
        category: t.category,
        user: t.user || 'Elric',
        tag: t.tag || '',
        notes: t.notes || '',
        is_reimbursed: t.is_reimbursed || false,
        reimbursement_amount: t.reimbursement_amount || ''
    });
    setEditingId(t.id);
    setView('dashboard'); // Switch to dashboard where the form is
    if (!opened) toggleForm(); // Ensure form is expanded
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    if (!form.description || !form.description.trim()) {
      alert("Please enter a description.");
      return;
    }
    if (!form.amount || isNaN(parseFloat(form.amount))) {
      alert("Please enter a valid amount.");
      return;
    }
    if (!form.date) {
      alert("Please select a date.");
      return;
    }

    try {
      const baseUrl = import.meta.env.BASE_URL.replace(/\/$/, '');
      const payload = {
        ...form,
        date: dayjs(form.date).format('YYYY-MM-DD'),
        amount: parseFloat(form.amount),
        is_reimbursed: form.is_reimbursed || false,
        reimbursement_amount: form.is_reimbursed ? (parseFloat(form.reimbursement_amount) || 0) : 0
      };

      if (editingId) {
        await axios.put(`${baseUrl}/api/transactions/${editingId}`, payload);
        setEditingId(null);
      } else {
        await axios.post(`${baseUrl}/api/transactions/`, payload);
      }
      
      if (opened) toggleForm(); 
      
      setForm({
        date: new Date(),
        description: '',
        amount: '',
        necessity: 3,
        method: 'Rogue Debit',
        category: 'Groceries',
        user: 'Elric',
        tag: '',
        notes: '',
        is_reimbursed: false,
        reimbursement_amount: ''
      });

      // Small delay to ensure DB commit is finished before fetch
      setTimeout(() => {
        fetchTransactions();
      }, 300);
    } catch (error) {
      console.error("Error saving transaction:", error)
      const errorDetail = error.response?.data?.detail;
      const errorMessage = typeof errorDetail === 'object' 
        ? JSON.stringify(errorDetail) 
        : (errorDetail || error.message);
      alert("Failed to save transaction: " + errorMessage);
    }
  }

  const handleExportAI = () => {
    // Generate pre-computed monthly data rows
    const monthlyRows = monthlyIncomeSpendingData.slice().reverse().map(m => {
      const sRate = m.GrossIncome > 0 ? (m.Savings / m.GrossIncome) * 100 : 0;
      const livSpend = m.TotalSpending - m.Tithing;
      const spRatio = m.NetIncome > 0 ? (livSpend / m.NetIncome) * 100 : 0;
      return `${m.name},${m.Tithing.toFixed(2)},${m.GrossIncome.toFixed(2)},${m.NetIncome.toFixed(2)},${m.TotalSpending.toFixed(2)},${livSpend.toFixed(2)},${m.Savings.toFixed(2)},${sRate.toFixed(1)}%,${m.NetIncome > 0 ? spRatio.toFixed(1) + '%' : '0.0%'}`;
    }).join('\n');

    const promptText = `SYSTEM PROMPT:
The following data represents shared spending since 2025 by Elric and Mya, recorded on our custom website. 

### Context & Data Anomalies:
* **Approximate Dates:** Transactions logged by Mya on the 1st of any month indicate historical backfilling. The exact calendar day for these entries is unknown; only the month is accurate.
* **Subjective Metric:** The \`necessity\` column (1-5) is a personal, subjective scale.
* **LDS Tithing & Income Inference:** Elric is LDS and pays exactly 10% of gross income as tithing (logged under category 'Tithing', case-insensitive).
  - Calculated Gross Income = Tithing Paid * 10
  - Calculated Net Income (after tithing) = Tithing Paid * 9
  - Living Spending = Total Spending - Tithing Paid
  - Net Savings = Net Income - Living Spending (or Gross Income - Total Spending)
  - Savings Rate = (Net Savings / Gross Income) * 100

### New BudgetStar Metrics & Pacing Features (Refer to these):
* **Pacing & Daily Limits:** 
  - The app calculates a "Daily Pace Limit" representing the maximum hypothetical spending rate for remaining days of the current month to stay within the 3-month average budget.
  - Current Date: ${dayjs().format('YYYY-MM-DD')} (Day ${dayjs().date()} of ${dayjs().daysInMonth()})
  - Spent this Month (within selected filters): $${stats.spentThisMonth.toFixed(2)}
  - Past 3-Month Average Budget: $${stats.past3MonthsAvg.toFixed(2)}
  - Daily Budget Target (based on 3-mo average): $${stats.dailyTarget.toFixed(2)}/day
  - Current Daily Average: $${stats.actualDailyAvg.toFixed(2)}/day
  - Remaining Daily Pace Limit: $${stats.maxDailyRemaining.toFixed(2)}/day
* **Active Filter Summary Metrics:**
  - Active Period Filter: ${period} ${period === 'custom' ? `(${dayjs(startDate).format('YYYY-MM-DD')} to ${dayjs(endDate).format('YYYY-MM-DD')})` : ''}
  - Selected Payment Methods: ${selectedMethods.length > 0 ? selectedMethods.join(', ') : 'All'}
  - Total Tithing Paid: $${incomeStats.tithingPaid.toFixed(2)}
  - Calculated Gross Income: $${incomeStats.grossIncome.toFixed(2)}
  - Calculated Net Income (after tithing): $${incomeStats.netIncome.toFixed(2)}
  - Total Living Spending (excluding tithing): $${incomeStats.livingSpent.toFixed(2)}
  - Net Savings / Surplus: $${incomeStats.netSavings.toFixed(2)}
  - Overall Savings Rate: ${incomeStats.savingsRate.toFixed(1)}%
  - Living Spending / Net Income Ratio: ${incomeStats.netIncome > 0 ? ((incomeStats.livingSpent / incomeStats.netIncome) * 100).toFixed(1) + '%' : '0.0%'}

### Instructions:
1. **Analyze Spending Patterns:** Provide constructive financial insights and actionable tips based on the actual spending data. Identify trends, potential savings, or interesting correlations.
2. **Income & Tithing Insights:** Analyze our spending-to-income, living spending-to-net income ratio, and savings rate. Let us know how well we are living within our 90% net income, evaluate our savings rate, and analyze cash flow trends over time.
3. **Daily Pace Limit Analysis:** Incorporate our Daily Pace Limit metrics. Provide suggestions on how we can align our actual daily spending rate ($${stats.actualDailyAvg.toFixed(2)}/day) with the daily budget target ($${stats.dailyTarget.toFixed(2)}/day), and explain if our remaining pace limit ($${stats.maxDailyRemaining.toFixed(2)}/day) is realistic or if we are pacing over budget.
4. **Be Constructive:** Avoid overly critical feedback on the logging method itself. Focus on helping us understand our financial habits better.
5. **Formulate Analytical Questions:** Ask questions that could help us dig deeper into the split/reimbursement model, savings optimization, or long-term financial goals.
6. **Website/Logging Feedback:** Conclude your response with only one or two brief suggestions for database schema or UI/UX improvements that could help mitigate tracking issues.

**Prioritize financial analysis and spending/saving/tithing insights as the main body of your response.**

COLUMNS:
- Date: YYYY-MM-DD
- Description: Transaction details
- Amount: USD value
- Category: Budget category
- Method: Payment method
- User: Who made the purchase (Elric or Mya)
- Necessity: 1 (Lowest/Optional) to 5 (Highest/Essential)
- Notes: User context
- Is Reimbursed: 1 if reimbursed, 0 otherwise
- Reimbursement Amount: Amount of reimbursement received

### PRE-COMPUTED MONTHLY FINANCIAL LOG SUMMARY:
Below is the pre-aggregated monthly income, tithing, spending, savings, and ratio breakdown calculated by BudgetStar:
Month,Tithing Paid,Calculated Gross Income,Calculated Net Income,Total Spending,Living Spending,Net Savings,Savings Rate,Living/Net Ratio
${monthlyRows}

DATA (CSV FORMAT):
date,description,amount,category,method,user,necessity,notes,is_reimbursed,reimbursement_amount
${transactions.map(t => 
  `${t.date},"${t.description.replace(/"/g, '""')}",${t.amount},${t.category},${t.method},${t.user || 'Elric'},${t.necessity},"${(t.notes || '').replace(/"/g, '""')}",${t.is_reimbursed ? 1 : 0},${t.reimbursement_amount || 0}`
).join('\n')}
`;
    const blob = new Blob([promptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `budget_data_ai_${dayjs().format('YYYY-MM-DD')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
        try {
            const baseUrl = import.meta.env.BASE_URL.replace(/\/$/, '');
            await axios.delete(`${baseUrl}/api/transactions/${id}`);
            fetchTransactions();
        } catch (error) {
            console.error("Error deleting transaction:", error);
        }
    }
  }

  const renderGoals = () => (
    <Stack gap="lg" mb="xl">
        <Title order={4}>Current Goals</Title>
        <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }}>
            {goals.map(g => {
                const now = dayjs();
                let start = g.period === 'month' ? now.startOf('month') : now.startOf('week');
                
                const spent = transactions
                    .filter(t => t.category === g.category && dayjs(t.date).isAfter(start))
                    .reduce((acc, t) => acc + (t.amount - (t.reimbursement_amount || 0)), 0);
                
                const batteryLevel = Math.max(0, 100 - (spent / g.amount) * 100);
                const isOver = spent > g.amount;

                return (
                    <Paper key={g.id} p="md" withBorder style={{ backgroundColor: '#121212', borderColor: '#2A2A2A' }}>
                        <Group justify="space-between" mb="xs">
                            <Text fw={700} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: getCategoryColor(g.category) }} />
                                {g.category}
                            </Text>
                            <Badge variant="light" color={g.period === 'month' ? 'blue' : 'grape'}>{g.period === 'month' ? 'Monthly' : 'Weekly'}</Badge>
                        </Group>
                        <Group justify="space-between" mb="xs">
                            <Text size="sm">Spent: ${spent.toFixed(2)}</Text>
                            <Text size="sm">Target: ${g.amount.toFixed(2)}</Text>
                        </Group>
                        <Progress value={batteryLevel} color={batteryLevel < 15 ? 'red' : batteryLevel < 35 ? 'yellow' : ACCENT_COLOR} size="xl" radius="xl" />
                        {isOver ? (
                            <Text c="red" size="xs" mt="xs" fw={700}>Battery Depleted! Over by ${(spent - g.amount).toFixed(2)}</Text>
                        ) : (
                            <Text c="dimmed" size="xs" mt="xs">{batteryLevel.toFixed(0)}% Battery Remaining (${(g.amount - spent).toFixed(2)})</Text>
                        )}
                        <Group justify="flex-end" mt="md">
                            <Button variant="subtle" color="red" size="xs" p={4} onClick={() => handleGoalDelete(g.id)}><IconTrash size={16}/></Button>
                        </Group>
                    </Paper>
                )
            })}
            {goals.length === 0 && (
                <Text c="dimmed" fs="italic">No goals set yet. Add one in the Goals tab!</Text>
            )}
        </SimpleGrid>
    </Stack>
  );

  const parseCSV = (text) => {
    const lines = text.split('\n');
    if (lines.length <= 1) return [];
    
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/^["']|["']$/g, ''));
    
    const parsed = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || line.split(',');
      const row = matches.map(val => val.trim().replace(/^["']|["']$/g, '').replace(/""/g, '"'));
      
      const item = {};
      headers.forEach((header, idx) => {
        item[header] = row[idx];
      });
      
      if (item.date) {
        parsed.push({
          date: item.date,
          description: item.description || 'No Description',
          amount: parseFloat(item.amount) || 0,
          category: item.category || 'Other',
          method: item.method || 'Cash',
          necessity: parseInt(item.necessity) || 3,
          notes: item.notes || '',
          is_reimbursed: item.is_reimbursed === '1' || item.is_reimbursed === 'true' || false,
          reimbursement_amount: parseFloat(item.reimbursement_amount) || 0
        });
      }
    }
    return parsed;
  };

  const handleExportJSON = () => {
    const backup = {
      transactions: getLocalData('budgetstar_transactions'),
      goals: getLocalData('budgetstar_goals'),
      recurrings: getLocalData('budgetstar_recurrings'),
      assets: getLocalData('budgetstar_assets'),
      savings: getLocalData('budgetstar_savings'),
      savings_accounts: getLocalData('budgetstar_savings_accounts'),
      settings: settings
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `budgetstar_backup_${dayjs().format('YYYY-MM-DD')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportJSON = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const backup = JSON.parse(event.target.result);
        if (backup.transactions) setLocalData('budgetstar_transactions', backup.transactions);
        if (backup.goals) setLocalData('budgetstar_goals', backup.goals);
        if (backup.recurrings) setLocalData('budgetstar_recurrings', backup.recurrings);
        if (backup.assets) setLocalData('budgetstar_assets', backup.assets);
        if (backup.savings) setLocalData('budgetstar_savings', backup.savings);
        if (backup.savings_accounts) setLocalData('budgetstar_savings_accounts', backup.savings_accounts);
        if (backup.settings) {
          setSettings(backup.settings);
          localStorage.setItem('budgetstar_settings', JSON.stringify(backup.settings));
        }
        alert("Backup imported successfully! The page will now reload.");
        window.location.reload();
      } catch (err) {
        alert("Failed to parse JSON backup: " + err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleExportCSV = () => {
    const data = getLocalData('budgetstar_transactions');
    const headers = ['date', 'description', 'amount', 'category', 'method', 'necessity', 'notes', 'is_reimbursed', 'reimbursement_amount'];
    const csvContent = [
      headers.join(','),
      ...data.map(t => [
        t.date,
        `"${(t.description || '').replace(/"/g, '""')}"`,
        t.amount,
        `"${(t.category || '').replace(/"/g, '""')}"`,
        `"${(t.method || '').replace(/"/g, '""')}"`,
        t.necessity,
        `"${(t.notes || '').replace(/"/g, '""')}"`,
        t.is_reimbursed ? 1 : 0,
        t.reimbursement_amount || 0
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `budgetstar_transactions_${dayjs().format('YYYY-MM-DD')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const parsed = parseCSV(text);
        if (parsed.length === 0) {
          alert("No valid transactions found in CSV.");
          return;
        }
        
        const mode = confirm(`Found ${parsed.length} transactions in CSV.\n\nClick OK to APPEND these transactions to your current list.\nClick Cancel to OVERWRITE all current transactions.`);
        
        if (mode) {
          const current = getLocalData('budgetstar_transactions');
          const combined = [...parsed, ...current];
          setLocalData('budgetstar_transactions', combined);
        } else {
          setLocalData('budgetstar_transactions', parsed);
        }
        
        alert("CSV transactions imported successfully! The page will now reload.");
        window.location.reload();
      } catch (err) {
        alert("Failed to parse CSV: " + err.message);
      }
    };
    reader.readAsText(file);
  };

  const renderSettings = () => {
    return (
      <Stack gap="xl">
        <Paper p="xl" withBorder style={{ backgroundColor: '#121212', borderColor: '#2A2A2A' }}>
          <Title order={3} mb="md" style={{ color: ACCENT_COLOR }}>Application Settings</Title>
          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Paper p="md" withBorder style={{ backgroundColor: '#1A1A1A', borderColor: '#2A2A2A' }}>
                <Title order={4} mb="sm">Features Toggles</Title>
                <Stack gap="sm">
                  <Checkbox 
                    label="Enable LDS Tithing & Income Inference" 
                    checked={settings.tithingEnabled} 
                    onChange={(e) => setSettings({ ...settings, tithingEnabled: e.currentTarget.checked })} 
                  />
                  <Checkbox 
                    label="Enable Savings Tracker" 
                    checked={settings.savingsEnabled} 
                    onChange={(e) => setSettings({ ...settings, savingsEnabled: e.currentTarget.checked })} 
                  />
                  {!settings.tithingEnabled && (
                    <NumberInput 
                      label="Monthly Net Income ($)" 
                      value={parseFloat(settings.manualIncome) || 0} 
                      onChange={(val) => setSettings({ ...settings, manualIncome: String(val) })} 
                      min={0}
                      styles={{ input: { backgroundColor: '#121212', borderColor: '#2A2A2A' } }}
                    />
                  )}
                </Stack>
              </Paper>
            </Grid.Col>
            
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Paper p="md" withBorder style={{ backgroundColor: '#1A1A1A', borderColor: '#2A2A2A' }}>
                <Title order={4} mb="sm">Manage Payment Methods</Title>
                <Group mb="sm">
                  <TextInput 
                    placeholder="New Payment Method" 
                    id="new-payment-method-input"
                    styles={{ input: { backgroundColor: '#121212', borderColor: '#2A2A2A' } }}
                  />
                  <Button 
                    color={ACCENT_COLOR} 
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
                    Add
                  </Button>
                </Group>
                <ScrollArea mah={150}>
                  <Stack gap="xs">
                    {settings.paymentMethods.map(method => (
                      <Group justify="space-between" key={method}>
                        <Text size="sm">{method}</Text>
                        <Button 
                          variant="subtle" 
                          color="red" 
                          size="xs"
                          onClick={() => {
                            setSettings({
                              ...settings,
                              paymentMethods: settings.paymentMethods.filter(m => m !== method)
                            });
                          }}
                        >
                          Remove
                        </Button>
                      </Group>
                    ))}
                  </Stack>
                </ScrollArea>
              </Paper>
            </Grid.Col>
          </Grid>
          
          <Paper p="md" withBorder mt="md" style={{ backgroundColor: '#1A1A1A', borderColor: '#2A2A2A' }}>
            <Title order={4} mb="sm">Data Backup & Restore</Title>
            <Text size="sm" c="dimmed" mb="md">
              Export your entire budget data (including transactions, goals, savings, and settings) as a JSON file, or import it back.
            </Text>
            <Group>
              <Button color="blue" onClick={handleExportJSON}>Export JSON Backup</Button>
              <Button color="teal" onClick={() => document.getElementById('json-import-file').click()}>Import JSON Backup</Button>
              <input 
                type="file" 
                id="json-import-file" 
                style={{ display: 'none' }} 
                accept=".json" 
                onChange={handleImportJSON} 
              />
            </Group>
          </Paper>

          <Paper p="md" withBorder mt="md" style={{ backgroundColor: '#1A1A1A', borderColor: '#2A2A2A' }}>
            <Title order={4} mb="sm">Import / Export CSV</Title>
            <Text size="sm" c="dimmed" mb="md">
              Upload transactions from a CSV file (e.g. from bank statement or backup) or download current transactions as CSV.
            </Text>
            <Group>
              <Button color="indigo" onClick={handleExportCSV}>Export CSV</Button>
              <Button color="orange" onClick={() => document.getElementById('csv-import-file').click()}>Import CSV</Button>
              <input 
                type="file" 
                id="csv-import-file" 
                style={{ display: 'none' }} 
                accept=".csv" 
                onChange={handleImportCSV} 
              />
            </Group>
          </Paper>
        </Paper>
      </Stack>
    );
  };

  const renderInfo = () => {
    return (
      <Stack gap="xl">
        <Paper p="xl" withBorder style={{ backgroundColor: '#121212', borderColor: '#2A2A2A' }}>
          <Title order={3} mb="md" style={{ color: ACCENT_COLOR }}>About BudgetStar</Title>
          <Text mb="lg">
              BudgetStar is an AI-enhanced financial tracking and budgeting application designed for real-time insights into your spending habits. 
              It helps you stay on top of your financial goals with a clean, widget-based dashboard.
          </Text>

          <Title order={4} mb="sm">Technical Architecture</Title>
          <Stack gap="md" mb="lg">
              <Paper p="md" withBorder style={{ backgroundColor: '#0A0A0A', borderColor: '#333' }}>
                  <Text fw={700} size="sm" mb="xs">Mathematics of Pace & Budgeting</Text>
                  <Text size="xs" c="dimmed" component="div">
                      • <b>Monthly Pace:</b> Calculated as <code>(CurrentSpend / (MonthlyTarget * (CurrentDay / DaysInMonth))) * 100</code>. This provides a projection of spending velocity relative to a linear daily burn rate.<br />
                      • <b>Battery Life:</b> <code>100 - ((Spent / Goal) * 100)</code>. Clamped to 0. Color state transitions occur at 0.35 (Warning) and 0.15 (Critical) thresholds.
                  </Text>
              </Paper>
              <Paper p="md" withBorder style={{ backgroundColor: '#0A0A0A', borderColor: '#333' }}>
                  <Text fw={700} size="sm" mb="xs">Stack Implementation</Text>
                  <Text size="xs" c="dimmed" component="div">
                      • <b>Backend:</b> FastAPI with SQLAlchemy (SQLModel) on SQLite. Asynchronous endpoints for transaction and goal CRUD.<br />
                      • <b>Frontend:</b> React 18 with Mantine UI. Heavy use of <code>useMemo</code> for client-side analytics and <code>dayjs</code> for complex date-range filtering.<br />
                      • <b>Deployment:</b> Multi-stage Docker build targeting a rootless Nginx container for the frontend and a slim Python environment for the backend.
                  </Text>
              </Paper>
          </Stack>

          <Divider mb="lg" />

          <Title order={4} mb="sm">Release Notes</Title>
          <Stack gap="md">
              <Paper p="sm" withBorder style={{ backgroundColor: '#1A1A1A', borderColor: '#333' }}>
                  <Group justify="space-between">
                      <Text fw={700}>v1.1</Text>
                      <Text size="xs" c="dimmed">June 13, 2026</Text>
                  </Group>
                  <Text size="sm" mt="xs">
                      • Disabled LDS Tithing & Income Inference by default to improve general user onboarding.<br />
                      • Separated Settings and Info & Help sections into their own dedicated pages.<br />
                      • Added top-level Upload CSV and Download CSV buttons for quick and easy browser data management.
                  </Text>
              </Paper>
              <Paper p="sm" withBorder style={{ backgroundColor: '#1A1A1A', borderColor: '#333', opacity: 0.8 }}>
                  <Group justify="space-between">
                      <Text fw={700}>v1.0 (General Release)</Text>
                      <Text size="xs" c="dimmed">June 13, 2026</Text>
                  </Group>
                  <Text size="sm" mt="xs">
                      • Ported private application into a generic local & hosted version.<br />
                      • Decoupled SQLite backend dependencies to support zero-config Standalone Mode (using browser `localStorage`).<br />
                      • Removed private family/user profiles and hardcoded bank settings.<br />
                      • Introduced customizable payment methods manager, JSON backup/restore, and CSV import/export settings.
                  </Text>
              </Paper>
              <Paper p="sm" withBorder style={{ backgroundColor: '#1A1A1A', borderColor: '#333', opacity: 0.6 }}>
                  <Group justify="space-between">
                      <Text fw={700}>v5.4</Text>
                      <Text size="xs" c="dimmed">June 12, 2026</Text>
                  </Group>
                  <Text size="sm" mt="xs">
                      • Added **Savings Locations & Account Management** support! You can now specify which savings account/location your savings entry belongs to.<br />
                      • Integrated dynamic **Add & Remove Savings Accounts** panel inside the Savings tab.<br />
                      • Added location column to the Savings checkpoints history log table.<br />
                      • Enhanced **Current Savings Balance** metric to calculate the sum of the latest balances for all active accounts.
                  </Text>
              </Paper>
              <Paper p="sm" withBorder style={{ backgroundColor: '#1A1A1A', borderColor: '#333', opacity: 0.4 }}>
                  <Group justify="space-between">
                      <Text fw={700}>v5.3</Text>
                      <Text size="xs" c="dimmed">June 12, 2026</Text>
                  </Group>
                  <Text size="sm" mt="xs">
                      • Added **Reimbursed Transactions** support! You can now check "Reimbursed?" when adding/editing transactions.<br />
                      • Added a dedicated **Reimbursed Transactions Log** table under the "Income & Tithing Analysis" tab.<br />
                      • Integrated a new **Savings Tracker** view on the sidebar, allowing you to log your current savings checkpoints over time.
                  </Text>
              </Paper>
              <Paper p="sm" withBorder style={{ backgroundColor: '#1A1A1A', borderColor: '#333', opacity: 0.4 }}>
                  <Group justify="space-between">
                      <Text fw={700}>v5.2</Text>
                      <Text size="xs" c="dimmed">June 11, 2026</Text>
                  </Group>
                  <Text size="sm" mt="xs">
                      • Added a **detailed custom tooltip** to the Monthly Income & Spending graph.<br />
                      • Added **Spending-to-Net-Income Ratio** indicator inside the "Living Spending" summary card.<br />
                      • Appended **Living / Net Ratio** column to the monthly breakdown log table.
                  </Text>
              </Paper>
              <Paper p="sm" withBorder style={{ backgroundColor: '#1A1A1A', borderColor: '#333', opacity: 0.4 }}>
                  <Group justify="space-between">
                      <Text fw={700}>v5.1</Text>
                      <Text size="xs" c="dimmed">June 11, 2026</Text>
                  </Group>
                  <Text size="sm" mt="xs">
                      • Added <b>Daily Pace Limit</b> widget to the main Dashboard showing remaining daily limits.<br />
                      • Integrated a daily pace target indicator inside the "Monthly Pace" widget.<br />
                      • Removed the "Income and Savings" summary card from the main Dashboard header.
                  </Text>
              </Paper>
          </Stack>
        </Paper>
      </Stack>
    );
  };


  const renderRecurrings = () => (
    <Stack gap="lg" mb="xl">
        <Title order={4}>Recurring Purchases</Title>
        
        {recurrings.length > 0 && (
            <Paper p="md" withBorder style={{ backgroundColor: '#121212', borderColor: '#2A2A2A' }}>
            <Table>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th style={{ color: '#AAAAAA' }}>Name</Table.Th>
                        <Table.Th style={{ color: '#AAAAAA' }}>Amount</Table.Th>
                        <Table.Th style={{ color: '#AAAAAA' }}>Category</Table.Th>
                        <Table.Th style={{ color: '#AAAAAA' }}>Frequency</Table.Th>
                        <Table.Th></Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {recurrings.map(r => (
                        <Table.Tr key={r.id} style={{ borderColor: '#2A2A2A' }}>
                            <Table.Td fw={500}>{r.name}</Table.Td>
                            <Table.Td>${r.amount.toFixed(2)}</Table.Td>
                            <Table.Td>
                                <Badge variant="dot" color={getCategoryColor(r.category)}>{r.category}</Badge>
                            </Table.Td>
                            <Table.Td style={{ textTransform: 'capitalize' }}>{r.period}</Table.Td>
                            <Table.Td>
                                <Button variant="subtle" color="red" size="xs" p={4} onClick={() => handleDeleteRecurring(r.id)}><IconTrash size={16} /></Button>
                            </Table.Td>
                        </Table.Tr>
                    ))}
                </Table.Tbody>
            </Table>
            </Paper>
        )}
        
        {recurrings.length === 0 && (
            <Text c="dimmed" fs="italic">No recurring purchases tracked yet.</Text>
        )}
    </Stack>
  );

  const renderAssets = () => {
    const totalPurchasePrice = assets.reduce((acc, a) => acc + (a.purchase_price || 0), 0);
    const totalEstimatedValue = assets.reduce((acc, a) => acc + (a.estimated_value || 0), 0);
    const valueChange = totalEstimatedValue - totalPurchasePrice;

    return (
    <Stack gap="lg" mb="xl">
        <Title order={4}>Asset Net Worth</Title>
        <SimpleGrid cols={{ base: 1, sm: 3 }} mb="md">
            <Paper p="md" withBorder style={{ backgroundColor: '#121212', borderColor: '#2A2A2A' }}>
                <Text size="xs" c="dimmed" fw={700}>TOTAL PURCHASE COST</Text>
                <Text size="xl" fw={700}>${totalPurchasePrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
            </Paper>
            <Paper p="md" withBorder style={{ backgroundColor: '#121212', borderColor: '#2A2A2A' }}>
                <Text size="xs" c="dimmed" fw={700}>CURRENT NET VALUE</Text>
                <Text size="xl" fw={700} color={totalEstimatedValue >= totalPurchasePrice ? ACCENT_COLOR : 'red'}>
                    ${totalEstimatedValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </Text>
            </Paper>
            <Paper p="md" withBorder style={{ backgroundColor: '#121212', borderColor: '#2A2A2A' }}>
                <Text size="xs" c="dimmed" fw={700}>TOTAL APPRECIATION/DEPR.</Text>
                <Group gap="xs">
                    <Text size="xl" fw={700} color={valueChange >= 0 ? 'green' : 'red'}>
                        {valueChange >= 0 ? '+' : ''}${valueChange.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </Text>
                    <Badge color={valueChange >= 0 ? 'green' : 'red'} variant="light">
                        {totalPurchasePrice > 0 ? ((valueChange / totalPurchasePrice) * 100).toFixed(1) : 0}%
                    </Badge>
                </Group>
            </Paper>
        </SimpleGrid>

        <Divider color="#2A2A2A" label="Individual Assets" labelPosition="center" />

        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
            {assets.map(asset => (
                <Paper key={asset.id} p="md" withBorder style={{ backgroundColor: '#121212', borderColor: '#2A2A2A', position: 'relative' }}>
                    <Stack gap="xs">
                        <Group justify="space-between">
                            <Text fw={700} size="lg">{asset.name}</Text>
                            <Group gap={4}>
                                <ActionIcon variant="subtle" color="blue" onClick={() => {
                                    setEditingAsset(asset);
                                    setAssetForm({
                                        name: asset.name,
                                        purchase_date: dayjs(asset.purchase_date).toDate(),
                                        purchase_price: asset.purchase_price,
                                        estimated_value: asset.estimated_value,
                                        description: asset.description,
                                        updated_at: dayjs(asset.updated_at).toDate()
                                    });
                                }}>
                                    <IconSettings size={16} />
                                </ActionIcon>
                                <ActionIcon variant="subtle" color="red" onClick={() => handleDeleteAsset(asset.id)}>
                                    <IconTrash size={16} />
                                </ActionIcon>
                            </Group>
                        </Group>
                        
                        <Divider color="#2A2A2A" />
                        
                        <Grid>
                            <Grid.Col span={6}>
                                <Text size="xs" c="dimmed">Purchase Price</Text>
                                <Text fw={600}>${asset.purchase_price.toLocaleString()}</Text>
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <Text size="xs" c="dimmed">Estimated Value</Text>
                                <Text fw={600} color={asset.estimated_value >= asset.purchase_price ? 'green' : 'red'}>
                                    ${asset.estimated_value.toLocaleString()}
                                </Text>
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <Text size="xs" c="dimmed">Purchase Date</Text>
                                <Text size="sm">{dayjs(asset.purchase_date).format('MMM D, YYYY')}</Text>
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <Text size="xs" c="dimmed">Last Updated</Text>
                                <Text size="sm">{dayjs(asset.updated_at).format('MMM D, YYYY')}</Text>
                            </Grid.Col>
                        </Grid>

                        {asset.description && (
                            <>
                                <Text size="xs" c="dimmed" mt="xs">Information / Log</Text>
                                <Paper p="xs" style={{ backgroundColor: '#0A0A0A', fontSize: '12px' }}>
                                    <Text size="xs">{asset.description}</Text>
                                </Paper>
                            </>
                        )}
                    </Stack>
                </Paper>
            ))}
        </SimpleGrid>
        {assets.length === 0 && (
            <Text c="dimmed" fs="italic">No assets tracked yet.</Text>
        )}
    </Stack>
    );
  };

  const renderSavings = () => {
    const activeAccountNames = new Set(savingsAccounts.map(acc => acc.name));
    
    // Group savings entries by account and find the latest balance for each, filtering by active accounts
    const latestByAccount = {};
    savings.forEach(s => {
      const acc = s.account_name || 'Cash';
      if (activeAccountNames.size > 0 ? activeAccountNames.has(acc) : true) {
        if (!(acc in latestByAccount)) {
          latestByAccount[acc] = s;
        }
      }
    });
    const totalCurrentSavings = Object.values(latestByAccount).reduce((sum, s) => sum + s.amount, 0);
    const latestSaving = savings.length > 0 ? savings[0] : null;

    // Calculate correct cumulative savings balance over time for the trend chart
    const uniqueDates = Array.from(new Set(savings.map(s => s.date))).sort();
    let chartSavings = uniqueDates.map(dateStr => {
      const latestBalances = {};
      savings.forEach(s => {
        if (dayjs(s.date).isAfter(dayjs(dateStr))) return;
        const acc = s.account_name || 'Cash';
        if (activeAccountNames.size > 0 && !activeAccountNames.has(acc)) return;
        if (!(acc in latestBalances)) {
          latestBalances[acc] = s.amount;
        }
      });
      const totalOnDate = Object.values(latestBalances).reduce((sum, val) => sum + val, 0);
      return {
        date: dateStr,
        amount: totalOnDate
      };
    });

    // If there is only one unique date logged, prepend a point on the previous day with the same amount
    // to allow a flat trend line to render nicely instead of hiding the chart.
    if (chartSavings.length === 1) {
      const singlePoint = chartSavings[0];
      const prevDate = dayjs(singlePoint.date).subtract(1, 'day').format('YYYY-MM-DD');
      chartSavings = [
        { date: prevDate, amount: singlePoint.amount },
        singlePoint
      ];
    }
    
    return (
      <Stack gap="lg" mb="xl">
        <Title order={4}>Savings Balance History</Title>
        <SimpleGrid cols={{ base: 1, sm: 2 }} mb="md">
            <Paper p="md" withBorder style={{ backgroundColor: '#121212', borderColor: '#2A2A2A' }}>
                <Text size="xs" c="dimmed" fw={700}>CURRENT SAVINGS BALANCE</Text>
                <Text size="xl" fw={900} c="#2DD4BF" mt="xs">
                    ${totalCurrentSavings.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </Text>
                {latestSaving && (
                  <Text size="xs" c="dimmed" mt="xs">
                    Last updated on {dayjs(latestSaving.date).format('MMM DD, YYYY')}
                  </Text>
                )}
            </Paper>
            <Paper p="md" withBorder style={{ backgroundColor: '#121212', borderColor: '#2A2A2A' }}>
                <Text size="xs" c="dimmed" fw={700}>TOTAL ENTRIES</Text>
                <Text size="xl" fw={700} mt="xs">
                    {savings.length}
                </Text>
                <Text size="xs" c="dimmed" mt="xs">
                    recorded savings checkpoints
                  </Text>
            </Paper>
        </SimpleGrid>
 
        <Grid mb="md">
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Paper p="md" withBorder style={{ backgroundColor: '#121212', borderColor: '#2A2A2A', height: 350 }}>
              <Title order={4} mb="md">Savings Growth Trend</Title>
              {chartSavings.length > 1 ? (
                <ResponsiveContainer width="100%" height="85%">
                  <AreaChart data={chartSavings}>
                    <defs>
                      <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2DD4BF" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#2DD4BF" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tickFormatter={(tick) => dayjs(tick).format('MMM YY')} stroke="#AAAAAA" />
                    <YAxis stroke="#AAAAAA" tickFormatter={(val) => `$${val.toLocaleString()}`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1E1E1E', border: '1px solid #333333' }}
                      itemStyle={{ color: '#FFFFFF' }}
                      labelStyle={{ color: '#AAAAAA' }}
                      formatter={(value) => [`$${value.toLocaleString()}`, 'Savings Balance']}
                      labelFormatter={(label) => dayjs(label).format('MMMM DD, YYYY')}
                    />
                    <Area type="monotone" dataKey="amount" stroke="#2DD4BF" strokeWidth={2} fillOpacity={1} fill="url(#colorSavings)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <Group justify="center" align="center" style={{ height: '80%' }}>
                  <Text c="dimmed" fs="italic">Log savings checkpoints to view the trend chart.</Text>
                </Group>
              )}
            </Paper>
          </Grid.Col>
          
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Paper p="md" withBorder style={{ backgroundColor: '#121212', borderColor: '#2A2A2A', height: 350, display: 'flex', flexDirection: 'column' }}>
              <Title order={4} mb="xs">Savings Accounts</Title>
              <Text size="xs" c="dimmed" mb="md">Add or remove savings locations/accounts.</Text>
              
              <ScrollArea style={{ flexGrow: 1 }} mb="md">
                <Stack gap="xs">
                  {savingsAccounts.map(acc => (
                    <Group key={acc.id} justify="space-between" p="xs" style={{ backgroundColor: '#1C1C1C', borderRadius: '4px' }}>
                      <Text size="sm" fw={500}>{acc.name}</Text>
                      {acc.name !== 'Cash' && (
                        <ActionIcon variant="subtle" color="red" size="sm" onClick={() => handleDeleteAccount(acc.id)}>
                          <IconTrash size={14} />
                        </ActionIcon>
                      )}
                    </Group>
                  ))}
                  {savingsAccounts.length === 0 && (
                    <Text size="xs" c="dimmed" fs="italic">No accounts created.</Text>
                  )}
                </Stack>
              </ScrollArea>
              
              <Group gap="xs" align="flex-end" wrap="nowrap">
                <TextInput 
                  placeholder="e.g. Ally Savings" 
                  value={newAccountName} 
                  onChange={e => setNewAccountName(e.target.value)}
                  style={{ flexGrow: 1 }}
                  styles={{ input: { backgroundColor: '#1E1E1E', border: '1px solid #333' } }}
                />
                <Button color={ACCENT_COLOR} onClick={handleCreateAccount}>Add</Button>
              </Group>
            </Paper>
          </Grid.Col>
        </Grid>

        <Divider color="#2A2A2A" label="Savings History Log" labelPosition="center" />

        <ScrollArea>
          <Table verticalSpacing="sm" miw={600}>
            <Table.Thead>
              <Table.Tr style={{ borderColor: '#2A2A2A' }}>
                <Table.Th style={{ color: '#AAAAAA' }}>Date</Table.Th>
                <Table.Th style={{ color: '#AAAAAA' }}>Amount</Table.Th>
                <Table.Th style={{ color: '#AAAAAA' }}>Account / Location</Table.Th>
                <Table.Th style={{ color: '#AAAAAA' }}>Notes</Table.Th>
                <Table.Th style={{ color: '#AAAAAA' }}></Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {savings.map(saving => (
                <Table.Tr key={saving.id} style={{ borderColor: '#2A2A2A' }}>
                  <Table.Td>{dayjs(saving.date).format('YYYY-MM-DD')}</Table.Td>
                  <Table.Td fw={700} c="#2DD4BF">${saving.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Table.Td>
                  <Table.Td>
                    <Badge variant="light" color="teal">
                      {saving.account_name || 'Cash'}
                    </Badge>
                  </Table.Td>
                  <Table.Td>{saving.notes || <Text size="sm" c="dimmed" fs="italic">No notes</Text>}</Table.Td>
                  <Table.Td>
                    <Group gap={4} wrap="nowrap">
                        <Button 
                            variant="subtle" 
                            color="blue" 
                            size="xs" 
                            p={4}
                            onClick={() => {
                                setEditingSaving(saving);
                                setSavingForm({
                                    date: dayjs(saving.date).toDate(),
                                    amount: saving.amount,
                                    notes: saving.notes || '',
                                    user: saving.user || 'Elric',
                                    account_name: saving.account_name || 'Cash'
                                });
                            }}
                        >
                            <IconPencil size={16} />
                        </Button>
                        <Button 
                            variant="subtle" 
                            color="red" 
                            size="xs" 
                            p={4}
                            onClick={() => handleDeleteSaving(saving.id)}
                        >
                            <IconTrash size={16} />
                        </Button>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
              {savings.length === 0 && (
                <Table.Tr>
                  <Table.Td colSpan={6} style={{ textAlign: 'center' }}>
                    <Text c="dimmed" fs="italic">No savings entries logged yet.</Text>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </Stack>
    );
  };

  
  return (
    <AppShell
      padding="md"
      header={{ height: 60, collapsed: !mobileOpened && true }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: { mobile: !mobileOpened },
      }}
      footer={{ height: 80 }}
      styles={{
        main: { background: '#000000', color: '#FFFFFF', paddingTop: 'calc(var(--mantine-header-height, 0px) + 16px)', paddingBottom: 'calc(var(--mantine-footer-height, 0px) + 16px)' },
        navbar: { background: '#0A0A0A', borderRight: '1px solid #222222' },
        header: { background: '#0A0A0A', borderBottom: '1px solid #222222', display: 'flex', alignItems: 'center', paddingLeft: 16 },
        footer: { background: '#0A0A0A', borderTop: '1px solid #222222', display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '0 10px 12px 10px' }
      }}
    >
      <AppShell.Header hiddenFrom="sm">
          <Burger opened={mobileOpened} onClick={toggleMobile} size="sm" color="white" />
          <Title order={3} ml="md" style={{ color: '#FFFFFF' }}>BudgetStar</Title>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <AppShell.Section grow component={ScrollArea}>
          <FilterContent />
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Footer hiddenFrom="sm">
          <ActionIcon variant="subtle" size="lg" color={view === 'dashboard' ? ACCENT_COLOR : 'gray'} onClick={() => setView('dashboard')}>
              <IconDashboard size="1.8rem" />
          </ActionIcon>
          <ActionIcon variant="subtle" size="lg" color={view === 'log' ? ACCENT_COLOR : 'gray'} onClick={() => setView('log')}>
              <IconList size="1.8rem" />
          </ActionIcon>
          <ActionIcon variant="subtle" size="lg" color={view === 'trends' ? ACCENT_COLOR : 'gray'} onClick={() => setView('trends')}>
              <IconChartHistogram size="1.8rem" />
          </ActionIcon>
          {settings.tithingEnabled && (
            <ActionIcon variant="subtle" size="lg" color={view === 'income-tithing' ? ACCENT_COLOR : 'gray'} onClick={() => setView('income-tithing')}>
                <IconReportMoney size="1.8rem" />
            </ActionIcon>
          )}
          <ActionIcon variant="subtle" size="lg" color={view === 'settings' ? ACCENT_COLOR : 'gray'} onClick={() => setView('settings')}>
              <IconSettings size="1.8rem" />
          </ActionIcon>
          <ActionIcon variant="subtle" size="lg" color={filtersOpened ? ACCENT_COLOR : 'gray'} onClick={toggleFilters}>
              <IconFilter size="1.8rem" />
          </ActionIcon>
          <Burger opened={mobileOpened} onClick={toggleMobile} size="md" color="white" />
      </AppShell.Footer>

      <Drawer
        opened={filtersOpened}
        onClose={closeFilters}
        title="Filters & Settings"
        padding="md"
        size="md"
        position="bottom"
        hiddenFrom="sm"
        styles={{
            content: { background: '#0A0A0A', color: '#FFFFFF' },
            header: { background: '#0A0A0A', borderBottom: '1px solid #222222' }
        }}
      >
        <FilterContent isMobile />
      </Drawer>

      <AppShell.Main>
        <Container size="xl">
          <Group justify="space-between" mb="xl" wrap="nowrap">
            <Title 
              order={1} 
              style={{ 
                color: '#FFFFFF',
                userSelect: 'none'
              }}
            >
                {view === 'dashboard' ? 'Dashboard' : 
                 view === 'trends' ? 'Averages & Trends' : 
                 view === 'income-tithing' ? 'Income & Tithing Analysis' :
                 view === 'goals' ? 'Goals' :
                 view === 'recurrings' ? 'Recurring Purchases' :
                 view === 'assets' ? 'Assets' :
                 view === 'savings' ? 'Savings Tracker' :
                 view === 'settings' ? 'Application Settings' :
                 view === 'info' ? 'About & Info' :
                 view === 'data' ? 'Data Management' : 'Transaction Log'}
            </Title>
            
            <Group>
              <input 
                type="file" 
                id="csv-import-file-header" 
                style={{ display: 'none' }} 
                accept=".csv" 
                onChange={handleImportCSV} 
              />
              <Button 
                variant="outline" 
                color="orange" 
                leftSection={<IconUpload size="1.1rem" />}
                onClick={() => document.getElementById('csv-import-file-header').click()}
              >
                Upload CSV
              </Button>
              <Button 
                variant="outline" 
                color="indigo" 
                leftSection={<IconDownload size="1.1rem" />}
                onClick={handleExportCSV}
              >
                Download CSV
              </Button>
              <Button 
                leftSection={<IconPlus size="1.2rem" />} 
                color={ACCENT_COLOR} 
                onClick={() => {
                  if (view !== 'dashboard') setView('dashboard');
                  if (!opened) toggleForm();
                }}
              >
                Add Transaction
              </Button>
            </Group>
          </Group>

          {view === 'goals' && (
            <Stack gap="lg">
                <Paper p="md" withBorder style={{ backgroundColor: '#121212', borderColor: '#2A2A2A' }}>
                    <Title order={4} mb="md">Add New Goal</Title>
                    <Grid>
                        <Grid.Col span={{ base: 12, md: 4 }}>
                            <Select label="Category" data={allCategories} value={goalForm.category} onChange={val => setGoalForm({...goalForm, category: val})} />
                        </Grid.Col>
                        <Grid.Col span={{ base: 6, md: 4 }}>
                            <NumberInput label="Target Amount" prefix="$" value={goalForm.amount} onChange={val => setGoalForm({...goalForm, amount: val})} />
                        </Grid.Col>
                        <Grid.Col span={{ base: 6, md: 4 }}>
                            <Select label="Period" data={[{value: 'week', label: 'Per Week'}, {value: 'month', label: 'Per Month'}]} value={goalForm.period} onChange={val => setGoalForm({...goalForm, period: val})} />
                        </Grid.Col>
                        <Grid.Col span={12}>
                            <Group justify="flex-end">
                                <Button color={ACCENT_COLOR} onClick={handleGoalSubmit}>Save Goal</Button>
                            </Group>
                        </Grid.Col>
                    </Grid>
                </Paper>

                {renderGoals()}
            </Stack>
          )}

          {view === 'recurrings' && (
            <Stack gap="lg">
                <Paper p="md" withBorder style={{ backgroundColor: '#121212', borderColor: '#2A2A2A' }}>
                    <Title order={4} mb="md">Add Recurring Purchase</Title>
                    <Grid>
                        <Grid.Col span={{ base: 12, md: 3 }}>
                            <TextInput label="Name" placeholder="e.g. Netflix" value={recurringForm.name} onChange={e => setRecurringForm({...recurringForm, name: e.target.value})} />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 3 }}>
                            <Select label="Category" data={allCategories} value={recurringForm.category} onChange={val => setRecurringForm({...recurringForm, category: val})} />
                        </Grid.Col>
                        <Grid.Col span={{ base: 6, md: 3 }}>
                            <NumberInput label="Amount" prefix="$" value={recurringForm.amount} onChange={val => setRecurringForm({...recurringForm, amount: val})} />
                        </Grid.Col>
                        <Grid.Col span={{ base: 6, md: 3 }}>
                            <Select label="Period" data={[{value: 'week', label: 'Weekly'}, {value: 'month', label: 'Monthly'}, {value: 'year', label: 'Yearly'}]} value={recurringForm.period} onChange={val => setRecurringForm({...recurringForm, period: val})} />
                        </Grid.Col>
                        <Grid.Col span={12}>
                            <Group justify="flex-end">
                                <Button color={ACCENT_COLOR} onClick={handleRecurringSubmit} disabled={!recurringForm.name}>Save Recurring Purchase</Button>
                            </Group>
                        </Grid.Col>
                    </Grid>
                </Paper>

                {renderRecurrings()}
            </Stack>
          )}

          {view === 'assets' && (
            <Stack gap="lg">
                <Paper p="md" withBorder style={{ backgroundColor: '#121212', borderColor: '#2A2A2A' }}>
                    <Title order={4} mb="md">{editingAsset ? 'Edit Asset' : 'Add New Asset'}</Title>
                    <Grid>
                        <Grid.Col span={{ base: 12, md: 6 }}>
                            <TextInput label="Asset Name" placeholder="e.g. PC, Car, House" value={assetForm.name} onChange={e => setAssetForm({...assetForm, name: e.target.value})} />
                        </Grid.Col>
                        <Grid.Col span={{ base: 6, md: 3 }}>
                            <DateInput firstDayOfWeek={0} label="Purchase Date" value={assetForm.purchase_date} onChange={val => setAssetForm({...assetForm, purchase_date: val})} />
                        </Grid.Col>
                        <Grid.Col span={{ base: 6, md: 3 }}>
                            <DateInput firstDayOfWeek={0} label="Last Updated" value={assetForm.updated_at} onChange={val => setAssetForm({...assetForm, updated_at: val})} />
                        </Grid.Col>
                        <Grid.Col span={{ base: 6, md: 6 }}>
                            <NumberInput label="Purchase Price" prefix="$" value={assetForm.purchase_price} onChange={val => setAssetForm({...assetForm, purchase_price: val})} />
                        </Grid.Col>
                        <Grid.Col span={{ base: 6, md: 6 }}>
                            <NumberInput label="Estimated Value" prefix="$" value={assetForm.estimated_value} onChange={val => setAssetForm({...assetForm, estimated_value: val})} />
                        </Grid.Col>
                        <Grid.Col span={12}>
                            <Textarea label="Asset Info / Log" placeholder="Specs, maintenance, or any notes..." value={assetForm.description} onChange={e => setAssetForm({...assetForm, description: e.target.value})} />
                        </Grid.Col>
                        <Grid.Col span={12}>
                            <Group justify="flex-end">
                                {editingAsset && (
                                    <Button variant="default" onClick={() => {
                                        setEditingAsset(null);
                                        setAssetForm({
                                            name: '',
                                            purchase_date: new Date(),
                                            purchase_price: '',
                                            estimated_value: '',
                                            description: '',
                                            updated_at: new Date()
                                        });
                                    }}>Cancel Edit</Button>
                                )}
                                <Button color={ACCENT_COLOR} onClick={handleAssetSubmit} disabled={!assetForm.name}>
                                    {editingAsset ? 'Update Asset' : 'Save Asset'}
                                </Button>
                            </Group>
                        </Grid.Col>
                    </Grid>
                </Paper>

                {renderAssets()}
            </Stack>
          )}

          {view === 'savings' && (
            <Stack gap="lg">
                <Paper p="md" withBorder style={{ backgroundColor: '#121212', borderColor: '#2A2A2A' }}>
                    <Title order={4} mb="md">{editingSaving ? 'Edit Savings Record' : 'Record Savings Balance'}</Title>
                    <Grid>
                        <Grid.Col span={{ base: 12, md: 4 }}>
                            <NumberInput label="Savings Amount" prefix="$" value={savingForm.amount} onChange={val => setSavingForm({...savingForm, amount: val})} />
                        </Grid.Col>
                        <Grid.Col span={{ base: 6, md: 4 }}>
                            <DateInput firstDayOfWeek={0} label="Update Date" value={savingForm.date} onChange={val => setSavingForm({...savingForm, date: val})} />
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
                            <TextInput label="Notes / Description" placeholder="e.g. End of month check, extra savings, etc." value={savingForm.notes} onChange={e => setSavingForm({...savingForm, notes: e.target.value})} />
                        </Grid.Col>
                        <Grid.Col span={12}>
                            <Group justify="flex-end">
                                {editingSaving && (
                                    <Button variant="default" onClick={() => {
                                        setEditingSaving(null);
                                        setSavingForm({
                                            date: new Date(),
                                            amount: '',
                                            notes: '',
                                            account_name: 'Cash'
                                        });
                                    }}>Cancel Edit</Button>
                                )}
                                <Button color={ACCENT_COLOR} onClick={handleSavingSubmit} disabled={!savingForm.amount}>
                                    {editingSaving ? 'Update Record' : 'Save Record'}
                                </Button>
                            </Group>
                        </Grid.Col>
                    </Grid>
                </Paper>

                {renderSavings()}
            </Stack>
          )}

          {view === 'data' && (
            <Stack>
                <Paper p="md" withBorder style={{ backgroundColor: '#121212', borderColor: '#2A2A2A' }}>
                    <Title order={3} mb="md">Export Data</Title>
                    <Text c="dimmed" mb="xl">
                        Download your entire transaction history formatted specifically for AI analysis (ChatGPT, Gemini, Claude).
                        The file includes a system prompt and your data in CSV format.
                    </Text>
                    <Button 
                        leftSection={<IconFileDownload size="1.2rem" />}
                        color={ACCENT_COLOR}
                        size="md"
                        onClick={handleExportAI}
                    >
                        Download for AI Analysis
                    </Button>
                </Paper>
            </Stack>
          )}

          {view === 'dashboard' && (
            <>
              <Collapse in={opened}>
                <Paper p="md" mb="xl" withBorder style={{ backgroundColor: '#121212', borderColor: '#2A2A2A' }}>
                  <Grid>
                    <Grid.Col span={{ base: 12, md: 4 }}>
                      <TextInput label="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
                    </Grid.Col>
                    <Grid.Col span={{ base: 6, md: 4 }}>
                      <NumberInput label="Amount" prefix="$" value={form.amount} onChange={val => setForm({...form, amount: val})} />
                    </Grid.Col>
                    <Grid.Col span={{ base: 6, md: 4 }}>
                      <DateInput firstDayOfWeek={0} label="Date" value={form.date} onChange={date => setForm({...form, date})} />
                    </Grid.Col>
                    <Grid.Col span={{ base: 6, md: 4 }}>
                      <Select label="Category" data={allCategories} value={form.category} onChange={val => setForm({...form, category: val})} />
                    </Grid.Col>
                    <Grid.Col span={{ base: 6, md: 4 }}>
                      <Select label="Method" data={settings.paymentMethods} value={form.method} onChange={val => setForm({...form, method: val})} />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 4 }}>
                      <Text size="sm" mb={5}>Necessity ({form.necessity})</Text>
                      <Slider min={1} max={5} step={1} value={form.necessity} onChange={val => setForm({...form, necessity: val})} color={ACCENT_COLOR} />
                    </Grid.Col>
                    <Grid.Col span={{ base: 6, md: 3 }} style={{ display: 'flex', alignItems: 'center', paddingTop: '1.5rem' }}>
                      <Checkbox 
                        label="Reimbursed?" 
                        checked={form.is_reimbursed || false} 
                        onChange={e => {
                          const checked = e.currentTarget.checked;
                          setForm({
                            ...form,
                            is_reimbursed: checked,
                            reimbursement_amount: checked ? (form.reimbursement_amount || form.amount) : 0
                          });
                        }}
                        styles={{ label: { color: '#FFFFFF' } }}
                      />
                    </Grid.Col>
                    {form.is_reimbursed && (
                      <Grid.Col span={{ base: 6, md: 3 }}>
                        <NumberInput 
                          label="Reimbursement Amount" 
                          prefix="$" 
                          value={form.reimbursement_amount} 
                          onChange={val => setForm({...form, reimbursement_amount: val})} 
                        />
                      </Grid.Col>
                    )}
                    <Grid.Col span={12}>
                      <Textarea label="Notes (AI Context)" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="What was this for? Any specific details for Gemini?" />
                    </Grid.Col>
                    <Grid.Col span={12}>
                      <Group justify="flex-end">
                        <Button variant="default" onClick={() => {
                            if (editingId) setEditingId(null);
                            toggleForm();
                        }}>Cancel</Button>
                        <Button color={ACCENT_COLOR} onClick={handleSubmit}>{editingId ? 'Update Entry' : 'Log Entry'}</Button>
                      </Group>
                    </Grid.Col>
                  </Grid>
                </Paper>
              </Collapse>

              <SimpleGrid cols={{ base: 1, sm: 2, md: 5 }} mb="xl">
                <Paper p="md" withBorder className="hover-card" style={{ backgroundColor: '#121212', borderColor: '#2A2A2A' }}>
                  <Text size="xs" c="dimmed" fw={700}>TOTAL SPEND</Text>
                  <Text size="xl" fw={700} mt="xs">${stats.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                  <Text size="xs" c="dimmed">all-time total spend</Text>
                </Paper>
                <Paper p="md" withBorder className="hover-card" style={{ backgroundColor: '#121212', borderColor: '#2A2A2A' }}>
                  <Text size="xs" c="dimmed" fw={700}>SPENT THIS MONTH</Text>
                  <Text size="xl" fw={700} mt="xs">${stats.spentThisMonth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                  <Text size="xs" c="dimmed">current calendar month</Text>
                </Paper>
                <Paper p="md" withBorder className="hover-card" style={{ backgroundColor: '#121212', borderColor: '#2A2A2A' }}>
                  <Text size="xs" c="dimmed" fw={700}>MONTHLY PACE</Text>
                  <Text size="xl" fw={700} mt="xs">{stats.pacePercent.toFixed(0)}%</Text>
                  <Text size="xs" c="dimmed">vs 3-mo: ${stats.past3MonthsAvg.toLocaleString(undefined, { maximumFractionDigits: 0 })} (${stats.dailyTarget.toFixed(2)}/d)</Text>
                </Paper>
                <Paper p="md" withBorder className="hover-card" style={{ backgroundColor: '#121212', borderColor: '#2A2A2A' }}>
                  <Text size="xs" c="dimmed" fw={700}>AVG. / MONTH</Text>
                  <Text size="xl" fw={700} mt="xs">${stats.monthlyAvg.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                  <Text size="xs" c="dimmed">average monthly spending</Text>
                </Paper>
                <Paper p="md" withBorder className="hover-card" style={{ backgroundColor: '#121212', borderColor: '#2A2A2A' }}>
                  <Text size="xs" c="dimmed" fw={700}>DAILY PACE LIMIT</Text>
                  <Text size="xl" fw={700} mt="xs" c={stats.maxDailyRemaining >= stats.actualDailyAvg ? "green.4" : "red.4"}>
                    ${stats.maxDailyRemaining.toFixed(2)}/day
                  </Text>
                  <Text size="xs" c="dimmed">max limit today (actual: ${stats.actualDailyAvg.toFixed(2)}/d)</Text>
                </Paper>
              </SimpleGrid>

              {renderGoals()}

              <Grid mb="xl">
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Paper p="md" withBorder style={{ backgroundColor: '#121212', borderColor: '#2A2A2A', height: 500 }}>
                    <Group justify="space-between" mb="md" align="center">
                      <Title order={4}>Spending by Category</Title>
                      <SegmentedControl
                        size="xs"
                        data={[
                          { label: 'Pie Chart', value: 'pie' },
                          { label: 'Ranking', value: 'ranking' }
                        ]}
                        value={categoryChartView}
                        onChange={setCategoryChartView}
                        styles={{
                          root: { backgroundColor: '#141414', border: '1px solid #2A2A2A' },
                          indicator: { backgroundColor: ACCENT_COLOR },
                          control: { border: 'none' },
                          label: { fontSize: 'xs', fontWeight: 600 }
                        }}
                      />
                    </Group>
                    <ResponsiveContainer width="100%" height="90%">
                      {categoryChartView === 'pie' ? (
                        <PieChart>
                          <Pie
                            data={chartData.pieData}
                            innerRadius={60}
                            outerRadius={120}
                            paddingAngle={0}
                            dataKey="value"
                            labelLine={false}
                            label={renderCustomizedLabel}
                          >
                            {chartData.pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={getCategoryColor(entry.name)} stroke="none" />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#1E1E1E', border: '1px solid #333333' }}
                            itemStyle={{ color: '#FFFFFF' }}
                            formatter={(value) => `${value.toFixed(2)}`}
                          />
                          <Legend />
                        </PieChart>
                      ) : (
                        <BarChart
                          layout="vertical"
                          data={rankingData}
                          margin={{ top: 10, right: 35, left: 10, bottom: 5 }}
                        >
                          <XAxis type="number" hide />
                          <YAxis 
                            type="category" 
                            dataKey="name" 
                            stroke="#AAAAAA" 
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            width={100}
                          />
                          <Tooltip
                            contentStyle={{ backgroundColor: '#1E1E1E', border: '1px solid #333333' }}
                            itemStyle={{ color: '#FFFFFF' }}
                            formatter={(value, name, props) => [`$${props.payload.amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} (${value.toFixed(1)}%)`, 'Spent']}
                          />
                          <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={16}>
                            {rankingData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={getCategoryColor(entry.name)} />
                            ))}
                            <LabelList
                              dataKey="value"
                              position="right"
                              formatter={(v) => `${v.toFixed(1)}%`}
                              style={{ fill: '#FFFFFF', fontSize: 11, fontWeight: 600 }}
                            />
                          </Bar>
                        </BarChart>
                      )}
                    </ResponsiveContainer>
                  </Paper>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Paper p="md" withBorder style={{ backgroundColor: '#121212', borderColor: '#2A2A2A', height: 500 }}>
                    <Title order={4} mb="md">Monthly Trend</Title>
                    <ResponsiveContainer width="100%" height="90%">
                      <BarChart data={chartData.barData}>
                        <XAxis dataKey="name" stroke="#AAAAAA" />
                        <YAxis stroke="#AAAAAA" />
                        {stats.monthlyAvg > 0 && (
                          <ReferenceLine y={stats.monthlyAvg} stroke="red" strokeDasharray="3 3" label={{ position: 'top', value: `Avg: $${stats.monthlyAvg.toFixed(2)}`, fill: 'red', fontSize: 12 }} />
                        )}
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1E1E1E', border: '1px solid #333333' }}
                          itemStyle={{ color: '#FFFFFF' }}
                          formatter={(value) => `$${value.toFixed(2)}`}
                        />
                        <Bar dataKey="value" fill={ACCENT_COLOR} radius={[4, 4, 0, 0]}>
                           <LabelList 
                             dataKey="value" 
                             content={({ x, y, width, height, value }) => {
                               const val = `$${value.toFixed(2)}`;
                               const fontSize = 16;
                               const textWidth = val.length * (fontSize * 0.6); 
                               const isShort = height < textWidth + 20;
                               const cx = x + width / 2;
                               const cy = isShort ? y - 5 : y + 10;
                               return (
                                 <text
                                   x={cx}
                                   y={cy}
                                   fill={isShort ? 'white' : 'black'}
                                   textAnchor={isShort ? 'end' : 'start'}
                                   dominantBaseline="central"
                                   transform={`rotate(90, ${cx}, ${cy})`}
                                   style={{ fontSize: `${fontSize}px`, fontWeight: '900' }}
                                 >
                                   {val}
                                 </text>
                               );
                             }}
                           />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid.Col>
              </Grid>

              <Title order={3} mb="md" mt="xl">🛡️ Necessity Analytics</Title>
              <Grid mb="xl">
                <Grid.Col span={{ base: 12, md: 5 }}>
                  <Paper p="md" withBorder style={{ backgroundColor: '#121212', borderColor: '#2A2A2A', height: 400 }}>
                    <Title order={4} mb="md">Necessity Distribution</Title>
                    <ResponsiveContainer width="100%" height="90%">
                      <PieChart>
                        <Pie
                          data={necessityData.distData}
                          innerRadius={60}
                          outerRadius={120}
                          paddingAngle={0}
                          dataKey="value"
                          labelLine={false}
                          label={renderCustomizedLabel}
                        >
                          {necessityData.distData.map((entry, index) => {
                             const colors = { 1: '#F87171', 2: '#FB923C', 3: '#FACC15', 4: '#4ADE80', 5: '#22C55E' };
                             return <Cell key={`cell-${index}`} fill={colors[entry.name]} stroke="none" />
                          })}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1E1E1E', border: '1px solid #333333' }} 
                          itemStyle={{ color: '#FFFFFF' }}
                          labelStyle={{ color: '#FFFFFF' }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 7 }}>
                  <Paper p="md" withBorder style={{ backgroundColor: '#121212', borderColor: '#2A2A2A', height: 400 }}>
                    <Title order={4} mb="md">Category Necessity & Consistency</Title>
                    <ResponsiveContainer width="100%" height="90%">
                      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                        <XAxis type="number" dataKey="avg" name="Avg Necessity" domain={[0, 5]} stroke="#AAAAAA" />
                        <YAxis type="category" dataKey="category" name="Category" stroke="#AAAAAA" width={100} />
                        <ZAxis type="number" dataKey="count" range={[50, 400]} />
                        <Tooltip 
                          cursor={{ strokeDasharray: '3 3' }} 
                          contentStyle={{ backgroundColor: '#1E1E1E', border: '1px solid #333333' }}
                          itemStyle={{ color: '#FFFFFF' }}
                          labelStyle={{ color: '#FFFFFF' }}
                        />
                        <Scatter data={necessityData.consistencyData} fill={ACCENT_COLOR}>
                            {necessityData.consistencyData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.isFixed ? '#22C55E' : ACCENT_COLOR} />
                            ))}
                        </Scatter>
                      </ScatterChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid.Col>
              </Grid>
            </>
          )}

          {view === 'trends' && (
            <Stack gap="lg">
               <Paper p="md" withBorder style={{ backgroundColor: '#121212', borderColor: '#2A2A2A' }}>
                 <Group justify="space-between" mb="md">
                    <Title order={4}>Monthly Trends & Anomalies</Title>
                    <Group>
                        <Select
                            label="Compare against:"
                            placeholder="Select baseline"
                            data={PERIOD_OPTIONS}
                            value={comparisonPeriod}
                            onChange={setComparisonPeriod}
                            w={200}
                            styles={{ input: { backgroundColor: '#1E1E1E', border: '1px solid #333333' } }}
                        />
                        {comparisonPeriod === 'Custom' && (
                            <Group gap="xs">
                                <NumberInput
                                    value={customComparisonValue}
                                    onChange={(val) => setCustomComparisonValue(val)}
                                    min={1}
                                    w={80}
                                    styles={{ input: { backgroundColor: '#1E1E1E', border: '1px solid #333333' } }}
                                />
                                <Select
                                    value={customComparisonUnit}
                                    onChange={setCustomComparisonUnit}
                                    data={[
                                        { value: 'day', label: 'Days' },
                                        { value: 'week', label: 'Weeks' },
                                        { value: 'month', label: 'Months' }
                                    ]}
                                    allowDeselect={false}
                                    w={100}
                                    styles={{ input: { backgroundColor: '#1E1E1E', border: '1px solid #333333' } }}
                                />
                            </Group>
                        )}
                        <Button variant="outline" color={ACCENT_COLOR} onClick={() => setShowTrendsChart(!showTrendsChart)} mt={comparisonPeriod === 'Custom' ? 0 : 24}>
                            {showTrendsChart ? 'Hide Chart' : 'Show Chart'}
                        </Button>
                    </Group>
                 </Group>
                 <Text size="sm" c="dimmed" mb="lg">
                     Comparing <b>Avg/Month ({comparisonPeriod === 'Custom' ? `${customComparisonValue} ${customComparisonUnit}s` : comparisonPeriod})</b> vs. <b>Avg/Month ({period === 'Custom' ? `${customPeriodValue} ${customPeriodUnit}s` : period})</b>.
                 </Text>
                 
                 {showTrendsChart && (
                     <Box h={400} mb="xl">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={allCategories.map(cat => {
                                    // Calculate Baseline (Comparison Period)
                                    const baselineTx = getFilteredTransactions(transactions, comparisonPeriod, customComparisonValue, customComparisonUnit)
                                        .filter(t => t.category === cat && 
                                            (selectedMethods.length === 0 || selectedMethods.includes(t.method))
                                        );
                                    const baselineTotal = baselineTx.reduce((acc, t) => acc + (t.amount - (t.reimbursement_amount || 0)), 0);
                                    const baselineMonths = new Set(baselineTx.map(t => t.date.substring(0, 7))).size;
                                    const baselineAvg = baselineMonths > 0 ? baselineTotal / baselineMonths : 0;

                                    // Calculate Current (Selected Period)
                                    const currentTx = filteredTransactions.filter(t => t.category === cat);
                                    const currentTotal = currentTx.reduce((acc, t) => acc + (t.amount - (t.reimbursement_amount || 0)), 0);
                                    const currentMonths = new Set(currentTx.map(t => t.date.substring(0, 7))).size;
                                    const currentAvg = currentMonths > 0 ? currentTotal / currentMonths : 0;

                                    return {
                                        name: cat,
                                        Baseline: parseFloat(baselineAvg.toFixed(2)),
                                        Current: parseFloat(currentAvg.toFixed(2))
                                    };
                                }).filter(d => d.Baseline > 0 || d.Current > 0)}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                                <XAxis dataKey="name" stroke="#AAAAAA" tick={{fontSize: 10}} interval={0} angle={-45} textAnchor="end" height={60} />
                                <YAxis stroke="#AAAAAA" />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#1E1E1E', border: '1px solid #333333' }}
                                    itemStyle={{ color: '#FFFFFF' }}
                                    formatter={(value) => `$${value.toFixed(2)}`}
                                />
                                <Legend />
                                <Bar dataKey="Baseline" fill="#6B7280" name={`Avg (${comparisonPeriod === 'Custom' ? `${customComparisonValue}${customComparisonUnit.charAt(0)}` : comparisonPeriod})`} />
                                <Bar dataKey="Current" fill={ACCENT_COLOR} name={`Avg (${period === 'Custom' ? `${customPeriodValue}${customPeriodUnit.charAt(0)}` : period})`} />
                            </BarChart>
                        </ResponsiveContainer>
                     </Box>
                 )}

                 <ScrollArea>
                 <Table miw={600}>
                   <Table.Thead>
                     <Table.Tr>
                       <Table.Th>Category</Table.Th>
                       <Table.Th>Avg / Month ({comparisonPeriod === 'Custom' ? `${customComparisonValue} ${customComparisonUnit}s` : comparisonPeriod})</Table.Th>
                       <Table.Th>Avg / Month ({period === 'Custom' ? `${customPeriodValue} ${customPeriodUnit}s` : period})</Table.Th>
                       <Table.Th>Status</Table.Th>
                     </Table.Tr>
                   </Table.Thead>
                   <Table.Tbody>
                     {allCategories.map(cat => {
                       // 1. Calculate Baseline Monthly Average
                       const catTransactionsBase = getFilteredTransactions(transactions, comparisonPeriod, customComparisonValue, customComparisonUnit)
                         .filter(t => t.category === cat && 
                         (selectedMethods.length === 0 || selectedMethods.includes(t.method))
                       );
                       const totalBase = catTransactionsBase.reduce((acc, t) => acc + (t.amount - (t.reimbursement_amount || 0)), 0);
                       const uniqueMonthsBase = new Set(catTransactionsBase.map(t => t.date.substring(0, 7))).size;
                       const avgPerMonthBase = uniqueMonthsBase > 0 ? totalBase / uniqueMonthsBase : 0;
                       
                       // 2. Calculate Selected Period Monthly Average
                       const catTransactionsPeriod = filteredTransactions.filter(t => t.category === cat);
                       const totalPeriod = catTransactionsPeriod.reduce((acc, t) => acc + (t.amount - (t.reimbursement_amount || 0)), 0);
                       let uniqueMonthsPeriod = new Set(catTransactionsPeriod.map(t => t.date.substring(0, 7))).size;
                       const avgPerMonthPeriod = uniqueMonthsPeriod > 0 ? totalPeriod / uniqueMonthsPeriod : 0;

                       const isSpike = avgPerMonthPeriod > (avgPerMonthBase * 1.2) && avgPerMonthPeriod > 20;
                       const isLow = avgPerMonthPeriod < (avgPerMonthBase * 0.8) && avgPerMonthBase > 20;

                       if (avgPerMonthBase === 0 && avgPerMonthPeriod === 0) return null;

                       return (
                         <Table.Tr key={cat}>
                           <Table.Td fw={500}>{cat}</Table.Td>
                           <Table.Td>${avgPerMonthBase.toFixed(2)}</Table.Td>
                           <Table.Td>${avgPerMonthPeriod.toFixed(2)}</Table.Td>
                           <Table.Td>
                             {isSpike && (
                               <Badge color="red" variant="light">High (+{avgPerMonthBase > 0 ? ((avgPerMonthPeriod - avgPerMonthBase)/avgPerMonthBase * 100).toFixed(0) : '∞'}%)</Badge>
                             )}
                             {isLow && (
                               <Badge color="green" variant="light">Low ({avgPerMonthBase > 0 ? ((avgPerMonthPeriod - avgPerMonthBase)/avgPerMonthBase * 100).toFixed(0) : '-100'}%)</Badge>
                             )}
                             {!isSpike && !isLow && (
                               <Badge color="gray" variant="light">Normal</Badge>
                             )}
                           </Table.Td>
                         </Table.Tr>
                       )
                     })}
                     {(() => {
                        const baseTx = getFilteredTransactions(transactions, comparisonPeriod, customComparisonValue, customComparisonUnit)
                            .filter(t => 
                                (selectedMethods.length === 0 || selectedMethods.includes(t.method)) &&
                                (selectedCategories.length === 0 || selectedCategories.includes(t.category))
                            );
                        const baseTotal = baseTx.reduce((acc, t) => acc + (t.amount - (t.reimbursement_amount || 0)), 0);
                        const baseMonths = new Set(baseTx.map(t => t.date.substring(0, 7))).size;
                        const baseAvg = baseMonths > 0 ? baseTotal / baseMonths : 0;

                        const currentTotal = filteredTransactions.reduce((acc, t) => acc + (t.amount - (t.reimbursement_amount || 0)), 0);
                        const currentMonths = new Set(filteredTransactions.map(t => t.date.substring(0, 7))).size;
                        const currentAvg = currentMonths > 0 ? currentTotal / currentMonths : 0;

                        const isSpike = currentAvg > (baseAvg * 1.2) && currentAvg > 20;
                        const isLow = currentAvg < (baseAvg * 0.8) && baseAvg > 20;

                        return (
                             <Table.Tr key="TOTAL" style={{ borderTop: '2px solid #333', backgroundColor: '#1A1A1A' }}>
                               <Table.Td fw={900} style={{ fontSize: '1.1em' }}>TOTAL</Table.Td>
                               <Table.Td fw={900} style={{ fontSize: '1.1em' }}>${baseAvg.toFixed(2)}</Table.Td>
                               <Table.Td fw={900} style={{ fontSize: '1.1em' }}>${currentAvg.toFixed(2)}</Table.Td>
                               <Table.Td>
                                 {isSpike && (
                                   <Badge color="red" variant="filled">High (+{baseAvg > 0 ? ((currentAvg - baseAvg)/baseAvg * 100).toFixed(0) : '∞'}%)</Badge>
                                 )}
                                 {isLow && (
                                   <Badge color="green" variant="filled">Low ({baseAvg > 0 ? ((currentAvg - baseAvg)/baseAvg * 100).toFixed(0) : '-100'}%)</Badge>
                                 )}
                                 {!isSpike && !isLow && (
                                   <Badge color="gray" variant="filled">Normal</Badge>
                                 )}
                               </Table.Td>
                             </Table.Tr>
                        )
                     })()}
                   </Table.Tbody>
                 </Table>
                 </ScrollArea>
               </Paper>
            </Stack>
          )}

          {view === 'income-tithing' && (
            <Stack gap="lg">
              <style>{`
                .hover-card {
                  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease !important;
                }
                .hover-card:hover {
                  transform: translateY(-2px);
                  border-color: #2DD4BF !important;
                  box-shadow: 0 4px 12px rgba(45, 212, 191, 0.15) !important;
                }
              `}</style>

              {incomeStats.tithingPaid === 0 && (
                <Paper p="md" withBorder style={{ backgroundColor: '#2C0E0E', borderColor: '#8A1F1F', borderRadius: '8px' }}>
                  <Text size="md" fw={700} c="red">⚠️ No Tithing Payments Found in Selected Period ({period})</Text>
                  <Text size="sm" c="dimmed" mt="xs">
                    LDS tithing is used to calculate your gross and net income (representing 10% of gross). 
                    Try changing the filtered period on the sidebar to a wider range like "This Year" or "All Time".
                  </Text>
                </Paper>
              )}

              <SimpleGrid cols={{ base: 1, sm: 2, md: 5 }}>
                <Paper p="md" withBorder className="hover-card" style={{ backgroundColor: '#121212', borderColor: '#2A2A2A' }}>
                  <Text size="xs" c="dimmed" fw={700}>CALCULATED GROSS INCOME</Text>
                  <Text size="xl" fw={900} c="teal.4" mt="xs">
                    ${incomeStats.grossIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Text>
                  <Text size="xs" c="dimmed" mt="xs">Based on Tithing paid × 10</Text>
                </Paper>
                <Paper p="md" withBorder className="hover-card" style={{ backgroundColor: '#121212', borderColor: '#2A2A2A' }}>
                  <Text size="xs" c="dimmed" fw={700}>TITHING PAID (10%)</Text>
                  <Text size="xl" fw={900} c="#6366F1" mt="xs">
                    ${incomeStats.tithingPaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Text>
                  <Text size="xs" c="dimmed" mt="xs">Sum of 'Tithing' category</Text>
                </Paper>
                <Paper p="md" withBorder className="hover-card" style={{ backgroundColor: '#121212', borderColor: '#2A2A2A' }}>
                  <Text size="xs" c="dimmed" fw={700}>NET INCOME (90%)</Text>
                  <Text size="xl" fw={900} c="blue.4" mt="xs">
                    ${incomeStats.netIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Text>
                  <Text size="xs" c="dimmed" mt="xs">Gross Income minus Tithing</Text>
                </Paper>
                <Paper p="md" withBorder className="hover-card" style={{ backgroundColor: '#121212', borderColor: '#2A2A2A' }}>
                  <Text size="xs" c="dimmed" fw={700}>LIVING SPENDING</Text>
                  <Text size="xl" fw={900} c="orange.4" mt="xs">
                    ${incomeStats.livingSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Text>
                  <Text size="xs" c={incomeStats.netIncome > 0 && (incomeStats.livingSpent / incomeStats.netIncome) <= 1 ? "green.5" : "red.5"} mt="xs" fw={700}>
                    Ratio: {incomeStats.netIncome > 0 ? ((incomeStats.livingSpent / incomeStats.netIncome) * 100).toFixed(1) : '0.0'}% of Net
                  </Text>
                </Paper>
                <Paper p="md" withBorder className="hover-card" style={{ backgroundColor: '#121212', borderColor: '#2A2A2A' }}>
                  <Text size="xs" c="dimmed" fw={700}>NET SAVINGS / REMAINING</Text>
                  <Text size="xl" fw={900} c={incomeStats.netSavings >= 0 ? "green.4" : "red.4"} mt="xs">
                    ${incomeStats.netSavings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Text>
                  <Text size="xs" c={incomeStats.netSavings >= 0 ? "green.5" : "red.5"} mt="xs" fw={700}>
                    Savings Rate: {incomeStats.savingsRate.toFixed(1)}%
                  </Text>
                </Paper>
              </SimpleGrid>

              <Grid>
                <Grid.Col span={{ base: 12, md: 5 }}>
                  <Paper p="md" withBorder style={{ backgroundColor: '#121212', borderColor: '#2A2A2A', height: 400 }}>
                    <Title order={4} mb="md">Income Allocation Breakdown</Title>
                    {incomeStats.grossIncome > 0 ? (
                      <ResponsiveContainer width="100%" height="90%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Tithing Paid', value: incomeStats.tithingPaid },
                              { name: 'Living Spending', value: incomeStats.livingSpent },
                              { name: 'Savings / Remaining', value: Math.max(0, incomeStats.netSavings) }
                            ].filter(d => d.value > 0)}
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            <Cell key="cell-0" fill="#6366F1" stroke="none" />
                            <Cell key="cell-1" fill="#FB923C" stroke="none" />
                            <Cell key="cell-2" fill="#2CC55E" stroke="none" />
                          </Pie>
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#1E1E1E', border: '1px solid #333333' }}
                            itemStyle={{ color: '#FFFFFF' }}
                            formatter={(value) => `$${value.toFixed(2)}`}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <Group justify="center" align="center" style={{ height: '80%' }}>
                        <Text c="dimmed" fs="italic">No income data to show.</Text>
                      </Group>
                    )}
                  </Paper>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 7 }}>
                  <Paper p="md" withBorder style={{ backgroundColor: '#121212', borderColor: '#2A2A2A', height: 400 }}>
                    <Title order={4} mb="md">Monthly Income vs. Spending Comparison</Title>
                    <ResponsiveContainer width="100%" height="90%">
                      <BarChart data={monthlyIncomeSpendingData}>
                        <XAxis dataKey="name" stroke="#AAAAAA" />
                        <YAxis stroke="#AAAAAA" />
                        <Tooltip content={<CustomMonthlyTooltip />} />
                        <Legend />
                        <Bar dataKey="GrossIncome" fill="#2DD4BF" name="Gross Income (Tithing × 10)" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="NetIncome" fill="#3B82F6" name="Net Income (Tithing × 9)" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="TotalSpending" fill="#EF4444" name="Total Spending" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid.Col>
              </Grid>

              <Grid>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Paper p="md" withBorder style={{ backgroundColor: '#121212', borderColor: '#2A2A2A', height: '100%' }}>
                    <Group align="center" mb="xs">
                      <IconCalculator color={ACCENT_COLOR} />
                      <Title order={4}>Interactive Tithing & Income Planner</Title>
                    </Group>
                    <Text size="sm" c="dimmed" mb="lg">
                      Estimate budgets or back-calculate income variables based on LDS tithing payments.
                    </Text>
                    <Stack gap="md">
                      <NumberInput
                        label="Gross Income ($)"
                        placeholder="Enter gross income, e.g. 5000"
                        value={plannerGrossIncome}
                        onChange={(val) => {
                          setPlannerGrossIncome(val);
                          if (val !== '' && val !== null) {
                            setPlannerTithing(parseFloat((val * 0.1).toFixed(2)));
                          } else {
                            setPlannerTithing('');
                          }
                        }}
                        prefix="$"
                        thousandSeparator
                        styles={{ input: { backgroundColor: '#1E1E1E', border: '1px solid #333' } }}
                      />
                      <NumberInput
                        label="Tithing Amount ($) (10% of Gross)"
                        placeholder="Enter tithing paid, e.g. 500"
                        value={plannerTithing}
                        onChange={(val) => {
                          setPlannerTithing(val);
                          if (val !== '' && val !== null) {
                            setPlannerGrossIncome(parseFloat((val * 10).toFixed(2)));
                          } else {
                            setPlannerGrossIncome('');
                          }
                        }}
                        prefix="$"
                        thousandSeparator
                        styles={{ input: { backgroundColor: '#1E1E1E', border: '1px solid #333' } }}
                      />
                      
                      {plannerGrossIncome > 0 && (
                        <Paper p="sm" withBorder style={{ backgroundColor: '#1A1A1A', borderColor: '#333' }}>
                          <Grid>
                            <Grid.Col span={6}>
                              <Text size="xs" c="dimmed">Gross Income</Text>
                              <Text size="sm" fw={700}>${parseFloat(plannerGrossIncome).toLocaleString(undefined, {minimumFractionDigits: 2})}</Text>
                            </Grid.Col>
                            <Grid.Col span={6}>
                              <Text size="xs" c="dimmed">Required Tithing (10%)</Text>
                              <Text size="sm" fw={700} c="#6366F1">${(plannerGrossIncome * 0.1).toLocaleString(undefined, {minimumFractionDigits: 2})}</Text>
                            </Grid.Col>
                            <Grid.Col span={6}>
                              <Text size="xs" c="dimmed">Net Income (90%)</Text>
                              <Text size="sm" fw={700} c="blue.4">${(plannerGrossIncome * 0.9).toLocaleString(undefined, {minimumFractionDigits: 2})}</Text>
                            </Grid.Col>
                            <Grid.Col span={6}>
                              <Text size="xs" c="dimmed">Suggested Max Spending</Text>
                              <Text size="sm" fw={700} c="orange.4">${(plannerGrossIncome * 0.9).toLocaleString(undefined, {minimumFractionDigits: 2})}</Text>
                            </Grid.Col>
                          </Grid>
                        </Paper>
                      )}
                    </Stack>
                  </Paper>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Paper p="md" withBorder style={{ backgroundColor: '#121212', borderColor: '#2A2A2A', height: '100%' }}>
                    <Title order={4} mb="md">LDS Tithing & Financial Guidelines</Title>
                    <Stack gap="sm">
                      <Text size="sm">
                        <b>1. The 10% Principle:</b> In the Church of Jesus Christ of Latter-day Saints (LDS), tithing is defined as returning 10% of one's income to God. This tool calculates Gross Income by multiplying your actual tithing payments by 10.
                      </Text>
                      <Text size="sm">
                        <b>2. Gross vs. Net Tithing:</b> Some members choose to pay tithing based on gross income (before tax and deductions), while others pay on net income (take-home pay). In both cases, this dashboard reflects income calculated relative to tithing paid.
                      </Text>
                      <Text size="sm">
                        <b>3. Timing Variations:</b> Since tithing is often paid periodically (monthly, quarterly, or annually), monthly charts might fluctuate depending on when transactions are entered. The <b>Planner</b> allows you to see baseline income levels regardless of payment frequency.
                      </Text>
                    </Stack>
                  </Paper>
                </Grid.Col>
              </Grid>

              <Paper p="md" withBorder style={{ backgroundColor: '#121212', borderColor: '#2A2A2A' }}>
                <Title order={4} mb="md">Monthly Tithing & Income Log</Title>
                <ScrollArea>
                  <Table verticalSpacing="sm">
                    <Table.Thead>
                      <Table.Tr style={{ borderColor: '#2A2A2A' }}>
                        <Table.Th style={{ color: '#AAAAAA' }}>Month</Table.Th>
                        <Table.Th style={{ color: '#AAAAAA' }}>Tithing Paid</Table.Th>
                        <Table.Th style={{ color: '#AAAAAA' }}>Calculated Gross Income</Table.Th>
                        <Table.Th style={{ color: '#AAAAAA' }}>Calculated Net Income</Table.Th>
                        <Table.Th style={{ color: '#AAAAAA' }}>Total Spending</Table.Th>
                        <Table.Th style={{ color: '#AAAAAA' }}>Savings / Surplus</Table.Th>
                        <Table.Th style={{ color: '#AAAAAA' }}>Savings Rate</Table.Th>
                        <Table.Th style={{ color: '#AAAAAA' }}>Living / Net Ratio</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {monthlyIncomeSpendingData.slice().reverse().map((m) => {
                        const savingsRate = m.GrossIncome > 0 ? (m.Savings / m.GrossIncome) * 100 : 0;
                        const livingSpent = m.TotalSpending - m.Tithing;
                        const spendingRatio = m.NetIncome > 0 ? (livingSpent / m.NetIncome) * 100 : 0;
                        return (
                          <Table.Tr key={m.key} style={{ borderColor: '#2A2A2A' }}>
                            <Table.Td fw={600}>{m.name}</Table.Td>
                            <Table.Td c="#6366F1" fw={600}>${m.Tithing.toLocaleString(undefined, {minimumFractionDigits: 2})}</Table.Td>
                            <Table.Td c="teal.4">${m.GrossIncome.toLocaleString(undefined, {minimumFractionDigits: 2})}</Table.Td>
                            <Table.Td c="blue.4">${m.NetIncome.toLocaleString(undefined, {minimumFractionDigits: 2})}</Table.Td>
                            <Table.Td>${m.TotalSpending.toLocaleString(undefined, {minimumFractionDigits: 2})}</Table.Td>
                            <Table.Td c={m.Savings >= 0 ? "green.4" : "red.4"} fw={600}>
                              ${m.Savings.toLocaleString(undefined, {minimumFractionDigits: 2})}
                            </Table.Td>
                            <Table.Td c={m.Savings >= 0 ? "green.4" : "red.4"} fw={600}>
                              {savingsRate.toFixed(1)}%
                            </Table.Td>
                            <Table.Td c={spendingRatio <= 100 ? "green.4" : "red.4"} fw={600}>
                              {m.NetIncome > 0 ? `${spendingRatio.toFixed(1)}%` : '0.0%'}
                            </Table.Td>
                          </Table.Tr>
                        );
                      })}
                    </Table.Tbody>
                  </Table>
                </ScrollArea>
              </Paper>

              <Paper p="md" withBorder style={{ backgroundColor: '#121212', borderColor: '#2A2A2A' }}>
                <Title order={4} mb="md">Reimbursed Transactions Log</Title>
                <ScrollArea>
                  <Table verticalSpacing="sm">
                    <Table.Thead>
                      <Table.Tr style={{ borderColor: '#2A2A2A' }}>
                        <Table.Th style={{ color: '#AAAAAA' }}>Date</Table.Th>
                        <Table.Th style={{ color: '#AAAAAA' }}>Description</Table.Th>
                        <Table.Th style={{ color: '#AAAAAA' }}>Category</Table.Th>
                        <Table.Th style={{ color: '#AAAAAA' }}>Total Spent</Table.Th>
                        <Table.Th style={{ color: '#AAAAAA' }}>Reimbursement</Table.Th>
                        <Table.Th style={{ color: '#AAAAAA' }}>Net Loss / Cost</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {transactions.filter(t => t.is_reimbursed).map((t) => {
                        const netAmount = t.amount - t.reimbursement_amount;
                        return (
                          <Table.Tr key={t.id} style={{ borderColor: '#2A2A2A' }}>
                            <Table.Td>{t.date}</Table.Td>
                            <Table.Td fw={600}>{t.description}</Table.Td>
                            <Table.Td>
                              <Badge variant="dot" color={getCategoryColor(t.category)}>
                                {t.category}
                              </Badge>
                            </Table.Td>
                            <Table.Td fw={500}>${t.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</Table.Td>
                            <Table.Td fw={500} c="green.4">${t.reimbursement_amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</Table.Td>
                            <Table.Td fw={700} c={netAmount > 0 ? 'orange.4' : 'green.4'}>
                              ${netAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}
                            </Table.Td>
                          </Table.Tr>
                        )
                      })}
                      {transactions.filter(t => t.is_reimbursed).length === 0 && (
                        <Table.Tr>
                          <Table.Td colSpan={6} style={{ textAlign: 'center' }}>
                            <Text c="dimmed" fs="italic">No reimbursed transactions logged yet.</Text>
                          </Table.Td>
                        </Table.Tr>
                      )}
                    </Table.Tbody>
                  </Table>
                </ScrollArea>
              </Paper>
            </Stack>
          )}

          {view === 'log' && (
            <Paper p="md" withBorder style={{ backgroundColor: '#121212', borderColor: '#2A2A2A' }}>
              <Group justify="space-between" mb="md">
                <Title order={4}>Transaction Log</Title>
                <Button 
                    leftSection={<IconFileDownload size="1.2rem" />}
                    color={ACCENT_COLOR}
                    size="sm"
                    variant="light"
                    onClick={handleExportAI}
                >
                    Download Data for AI
                </Button>
              </Group>
              <ScrollArea>
              <Table verticalSpacing="sm" miw={700}>
                <Table.Thead>
                  <Table.Tr style={{ borderColor: '#2A2A2A' }}>
                    {['date', 'description', 'amount', 'category', 'method', 'necessity'].map((key) => (
                        <Table.Th
                            key={key}
                            style={{ color: '#AAAAAA', cursor: 'pointer' }}
                            onClick={() => handleSort(key)}
                        >
                            {key.charAt(0).toUpperCase() + key.slice(1)}
                            {sortConfig?.key === key ? (sortConfig.direction === 'asc' ? ' ↑' : ' ↓') : ''}
                        </Table.Th>
                    ))}
                    <Table.Th style={{ color: '#AAAAAA' }}>Notes</Table.Th>
                    <Table.Th style={{ color: '#AAAAAA' }}></Table.Th> {/* Action Column */}
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {sortedTransactions.map((t) => (
                    <Table.Tr key={t.id} style={{ borderColor: '#2A2A2A' }}>
                      <Table.Td>{t.date}</Table.Td>
                      <Table.Td fw={500}>{t.description}</Table.Td>
                      <Table.Td>
                        {t.is_reimbursed ? (
                          <Stack gap={2}>
                            <Text fw={500} style={{ textDecoration: t.amount === t.reimbursement_amount ? 'line-through' : 'none', color: '#888' }}>
                              ${t.amount.toFixed(2)}
                            </Text>
                            <Badge color="green" variant="light" size="xs">
                              Net: ${(t.amount - t.reimbursement_amount).toFixed(2)}
                            </Badge>
                          </Stack>
                        ) : (
                          <Text fw={500}>${t.amount.toFixed(2)}</Text>
                        )}
                      </Table.Td>
                      <Table.Td>
                        <Badge variant="dot" color={getCategoryColor(t.category)}>
                          {t.category}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Badge variant="light" color={METHOD_COLORS[t.method] || 'gray'}>
                          {t.method}
                        </Badge>
                      </Table.Td>
                      <Table.Td>{t.necessity}/5</Table.Td>
                      <Table.Td style={{ maxWidth: 200 }}>
                        {t.notes ? (
                          <Group gap="xs" wrap="nowrap">
                            <IconMessageChatbot size={14} color={ACCENT_COLOR} style={{ flexShrink: 0 }} />
                            <Text size="sm" truncate="end" title={t.notes}>{t.notes}</Text>
                          </Group>
                        ) : (
                          <Text size="sm" c="dimmed" fs="italic">No AI context</Text>
                        )}
                      </Table.Td>
                      <Table.Td>
                        <Group gap={4} wrap="nowrap">
                            <Button 
                                variant="subtle" 
                                color="blue" 
                                size="xs" 
                                p={4}
                                onClick={() => handleEdit(t)}
                            >
                                <IconPencil size={16} />
                            </Button>
                            <Button 
                                variant="subtle" 
                                color="red" 
                                size="xs" 
                                p={4}
                                onClick={() => handleDelete(t.id)}
                            >
                                <IconTrash size={16} />
                            </Button>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
              </ScrollArea>
            </Paper>
          )}

          {view === 'settings' && renderSettings()}
          {view === 'info' && renderInfo()}
        </Container>
      </AppShell.Main>
    </AppShell>
  )
}

export default App