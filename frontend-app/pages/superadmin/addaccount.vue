<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth'

definePageMeta({ middleware: ['role'] })

type Role = 'ADMIN' | string
type Account = { id: string; username: string; email: string; role: Role }

const accounts = ref<Account[]>([])
const { user, loadUser } = useAuth()

// ✅ ambil data dari backend
const fetchAccounts = async () => {
  try {
    const res = await fetch('http://localhost:3000/users', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
    accounts.value = await res.json()
  } catch (err) {
    console.error('Gagal ambil users:', err)
  }
}

onMounted(() => {
  if (typeof window !== 'undefined') loadUser()
  fetchAccounts()
})

const q = ref('')
const showModal = ref(false)
const editing = ref<Account | null>(null)

const form = reactive({
  username: '',
  name: '',
  role: 'ADMIN' as Role,
  password: '',
  confirmPassword: '',
  avatarPreview: '',
})

// Filter pencarian
const filtered = computed(() =>
  accounts.value.filter(a => {
    const matchQ =
      !q.value ||
      a.username.toLowerCase().includes(q.value.toLowerCase()) ||
      a.email.toLowerCase().includes(q.value.toLowerCase())
    const matchPos = !selectedPosition.value || a.role === selectedPosition.value
    return matchQ && matchPos
  })
)

// Buka modal tambah
const openAdd = () => {
  editing.value = null
  form.username = ''
  form.role = 'ADMIN'
  form.password = ''
  form.confirmPassword = ''
  showModal.value = true
}

// Buka modal edit
const openEdit = (acct: Account) => {
  editing.value = { ...acct }
  form.username = acct.username
  form.role = acct.role
  form.password = ''
  form.confirmPassword = ''
  showModal.value = true
}

// Simpan / update akun
const save = async () => {
  console.log('➡ Menyimpan akun:', { ...form, editing: editing.value }) // debug

  try {
    if (editing.value) {
      // TODO: implement update user kalau mau
      showModal.value = false
    } else {
      await fetch('http://localhost:3000/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          username: form.username,
          email: `${form.username}@mail.com`, // default email
          password: form.password,
          role: 'ADMIN',
        }),
      })
      await fetchAccounts() // refresh data setelah tambah
    }
    showModal.value = false
  } catch (err) {
    console.error('❌ Gagal simpan akun:', err)
    alert('Gagal menyimpan akun. Periksa koneksi server atau API.')
  }
}

// Hapus akun
const remove = async (id: string) => {
  if (!confirm('Yakin hapus akun ini?')) return
  try {
    await fetch(`http://localhost:3000/users/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
    await fetchAccounts()
  } catch (err) {
    console.error('Gagal hapus akun:', err)
  }
}

const setAvatarPreview = (e: Event) => {
  form.avatarPreview = (e.target as HTMLInputElement).value
}
</script>
