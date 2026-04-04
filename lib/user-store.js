const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function mapRowToUser(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    name: row.name,
    email: normalizeEmail(row.email),
    passwordHash: row.password_hash,
    plan: row.plan,
    imageGenerationCount: Number(row.image_generation_count) || 0,
    referral_source: row.referral_source || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    stripeCustomerEmail: row.stripe_customer_email || null,
    lastCheckoutSessionId: row.last_checkout_session_id || null,
    lastPaymentStatus: row.last_payment_status || null,
    role: row.role || "user",
  };
}

function mapUserToRow(user) {
  return {
    id: user.id,
    name: user.name,
    email: normalizeEmail(user.email),
    password_hash: user.passwordHash,
    plan: user.plan || "free",
    image_generation_count: Number(user.imageGenerationCount) || 0,
    referral_source: user.referral_source || null,
    created_at: user.createdAt,
    updated_at: user.updatedAt,
    stripe_customer_email: user.stripeCustomerEmail || null,
    last_checkout_session_id: user.lastCheckoutSessionId || null,
    last_payment_status: user.lastPaymentStatus || null,
    role: user.role || "user",
  };
}

function createFileStore(usersFilePath) {
  function ensureUserStore() {
    const directory = path.dirname(usersFilePath);

    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }

    if (!fs.existsSync(usersFilePath)) {
      fs.writeFileSync(usersFilePath, "[]\n", "utf8");
    }
  }

  async function listUsers() {
    ensureUserStore();

    try {
      const content = fs.readFileSync(usersFilePath, "utf8");
      const parsed = JSON.parse(content);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  async function writeUsers(users) {
    ensureUserStore();
    fs.writeFileSync(usersFilePath, `${JSON.stringify(users, null, 2)}\n`, "utf8");
  }

  return {
    mode: "file",
    isSupabaseEnabled: false,
    async listUsers() {
      return listUsers();
    },
    async getUserById(userId) {
      const users = await listUsers();
      return users.find((user) => user.id === userId) || null;
    },
    async getUserByEmail(email) {
      const users = await listUsers();
      const normalizedEmail = normalizeEmail(email);
      return users.find((user) => normalizeEmail(user.email) === normalizedEmail) || null;
    },
    async createUser(user) {
      const users = await listUsers();
      users.push(user);
      await writeUsers(users);
      return user;
    },
    async updateUser(userId, updater) {
      const users = await listUsers();
      const userIndex = users.findIndex((user) => user.id === userId);

      if (userIndex === -1) {
        return null;
      }

      const currentUser = users[userIndex];
      const nextUser = {
        ...currentUser,
        ...updater(currentUser),
        updatedAt: new Date().toISOString(),
      };

      users[userIndex] = nextUser;
      await writeUsers(users);
      return nextUser;
    },
  };
}

function createSupabaseStore({ supabaseUrl, supabaseServiceRoleKey, tableName, usersFilePath }) {
  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  async function listUsers() {
    const { data, error } = await supabase.from(tableName).select("*").order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return (data || []).map(mapRowToUser);
  }

  return {
    mode: "supabase",
    isSupabaseEnabled: true,
    async listUsers() {
      return listUsers();
    },
    async getUserById(userId) {
      const { data, error } = await supabase.from(tableName).select("*").eq("id", userId).maybeSingle();

      if (error) {
        throw error;
      }

      return mapRowToUser(data);
    },
    async getUserByEmail(email) {
      const { data, error } = await supabase
        .from(tableName)
        .select("*")
        .eq("email", normalizeEmail(email))
        .maybeSingle();

      if (error) {
        throw error;
      }

      return mapRowToUser(data);
    },
    async createUser(user) {
      const row = mapUserToRow(user);
      const { data, error } = await supabase.from(tableName).insert(row).select("*").single();

      if (error) {
        throw error;
      }

      return mapRowToUser(data);
    },
    async updateUser(userId, updater) {
      const currentUser = await this.getUserById(userId);

      if (!currentUser) {
        return null;
      }

      const nextUser = {
        ...currentUser,
        ...updater(currentUser),
        updatedAt: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from(tableName)
        .update(mapUserToRow(nextUser))
        .eq("id", userId)
        .select("*")
        .single();

      if (error) {
        throw error;
      }

      return mapRowToUser(data);
    },
    async seedFromFile() {
      const fileStore = createFileStore(usersFilePath);
      const users = await fileStore.listUsers();

      if (users.length === 0) {
        return { imported: 0 };
      }

      const rows = users.map(mapUserToRow);
      const { error } = await supabase.from(tableName).upsert(rows, { onConflict: "id" });

      if (error) {
        throw error;
      }

      return { imported: rows.length };
    },
  };
}

function createUserStore(options) {
  const {
    driver,
    usersFilePath,
    supabaseUrl,
    supabaseServiceRoleKey,
    tableName = "app_users",
  } = options;

  if (driver === "supabase") {
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for the supabase driver.");
    }

    return createSupabaseStore({
      supabaseUrl,
      supabaseServiceRoleKey,
      tableName,
      usersFilePath,
    });
  }

  if (driver === "file") {
    return createFileStore(usersFilePath);
  }

  if (supabaseUrl && supabaseServiceRoleKey) {
    return createSupabaseStore({
      supabaseUrl,
      supabaseServiceRoleKey,
      tableName,
      usersFilePath,
    });
  }

  return createFileStore(usersFilePath);
}

module.exports = {
  createUserStore,
};