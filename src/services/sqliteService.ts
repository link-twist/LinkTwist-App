import { CapacitorSQLite, SQLiteConnection } from '@capacitor-community/sqlite';

const sqlite = new SQLiteConnection(CapacitorSQLite);

export const sqliteService = { 
  
  // Initialize the database and create tables if they don't exist
  async initializeDB() {
    try {
      // Ensure you provide the correct database name and open the connection
      const ret = await sqlite.checkConnectionsConsistency();
      const isConn = (await sqlite.isConnection("app.db", false)).result;
      let db = null;
      if (ret.result && isConn) {
        db = await sqlite.retrieveConnection("app.db",false);
      } else {
        db = await sqlite.createConnection("app.db", false, "no-encryption", 1, false);
      }
      await db.open();

      // Create 'products' table if it doesn't exist
      const queryProducts = `CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY, title TEXT);`
      const resProducts = await db.execute(queryProducts);
      if(resProducts.changes && resProducts.changes.changes && resProducts.changes.changes < 0) {
        throw new Error(`Error: execute failed`);
      };

      // Create 'options' table if it doesn't exist
      const queryOptions = `CREATE TABLE IF NOT EXISTS options (id INTEGER PRIMARY KEY, product_id INTEGER, title TEXT)`
      const resOptions = await db.execute(queryOptions);
      if(resOptions.changes && resOptions.changes.changes && resOptions.changes.changes < 0) {
        throw new Error(`Error: execute failed`);
      };

      await sqlite.closeConnection("app.db",false);
      console.log('Database initialized and tables created.');

    } catch (error) {
      console.error('SQLite Initialization Error:', error);
    }
  },

  // Save products to the database
  async saveProducts(products: { id: number; title: string }[]) {

    try {
      const ret = await sqlite.checkConnectionsConsistency();
      const isConn = (await sqlite.isConnection("app.db", false)).result;
      let db = null;
      if (ret.result && isConn) {
        db = await sqlite.retrieveConnection("app.db",false);
      } else {
        db = await sqlite.createConnection("app.db", false, "no-encryption", 1, false);
      }
      await db.open();

      const deleteQuery = { statement: "DELETE FROM products;", values: [] };
      const insertQueries = products.map((product) => ({
        statement: "INSERT INTO products (id, title) VALUES (?, ?);",
        values: [product.id, product.title],
      }));
  
      await db.executeSet([deleteQuery, ...insertQueries]);
  
      await sqlite.closeConnection("app.db", false);
      
      console.log('Products saved successfully.');

    } catch (error) {
      console.error('Error saving products:', error);
    }
  },

  // Save options to the database
  async saveOptions(options: { id: number; product_id: number; title: string }[]) {
    try {
      const ret = await sqlite.checkConnectionsConsistency();
      const isConn = (await sqlite.isConnection("app.db", false)).result;
      let db = null;
  
      if (ret.result && isConn) {
        db = await sqlite.retrieveConnection("app.db", false);
      } else {
        db = await sqlite.createConnection("app.db", false, "no-encryption", 1, false);
      }
      await db.open();

      const deleteQuery = { statement: "DELETE FROM options;", values: [] };
      const insertQueries = options.map((option) => ({
        statement: "INSERT INTO options (id, product_id, title) VALUES (?, ?, ?);",
        values: [option.id, option.product_id, option.title],
      }));

      await db.executeSet([deleteQuery, ...insertQueries]);

      await sqlite.closeConnection("app.db", false);

      console.log('Options saved successfully.');

    } catch (error) {
      console.error('Error saving options:', error);
    }
  },

  // Fetch products from the database
  async getProducts(): Promise<{ id: number; title: string }[]> {
    try {
      const ret = await sqlite.checkConnectionsConsistency();
      const isConn = (await sqlite.isConnection("app.db", false)).result;
      let db = null;
  
      if (ret.result && isConn) {
        db = await sqlite.retrieveConnection("app.db", false);
      } else {
        db = await sqlite.createConnection("app.db", false, "no-encryption", 1, false);
      }
      await db.open();

      const result = await db.query("SELECT * FROM products");

      await sqlite.closeConnection("app.db",false);
      return result.values ?? [];
    } catch (error) {
      console.error("Error fetching products:", error);
      return [];
    }
  },
  

  // Fetch options from the database
  async getOptions(): Promise<{ id: number; product_id: number; title: string; }[]> {
    try {
      const ret = await sqlite.checkConnectionsConsistency();
      const isConn = (await sqlite.isConnection("app.db", false)).result;
      let db = null;

      if (ret.result && isConn) {
        db = await sqlite.retrieveConnection("app.db", false);
      } else {
        db = await sqlite.createConnection("app.db", false, "no-encryption", 1, false);
        await db.open();
      }

      const result = await db.query("SELECT * FROM options");

      await sqlite.closeConnection("app.db",false);
  
      return result.values ?? [];
    } catch (error) {
      console.error('Error fetching options:', error);
      return [];
    }
  },
};
