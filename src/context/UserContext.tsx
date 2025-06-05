import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";

interface Business {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  location?: string;
  createdAt?: any;
}

interface UserContextValue {
  user: User | null;
  role: "admin" | "emprendedor" | null;
  businesses: Business[];
  activeBusiness: Business | null;
  setActiveBusiness: (biz: Business) => void;
  loading: boolean;
}

const UserContext = createContext<UserContextValue>({
  user: null,
  role: null,
  businesses: [],
  activeBusiness: null,
  setActiveBusiness: () => {},
  loading: true,
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<"admin" | "emprendedor" | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [activeBusiness, setActiveBusinessState] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);

  const setActiveBusiness = (biz: Business) => {
    setActiveBusinessState(biz);
    localStorage.setItem("activeBusinessId", biz.id);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);

        try {
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const userSnap = await getDoc(userDocRef);

          if (userSnap.exists()) {
            const userData = userSnap.data();
            const uid = userSnap.id;

            setRole(userData.role || null);

            if (userData.role === "emprendedor") {
              const businessQuery = query(collection(db, "businesses"), where("ownerId", "==", uid));
              const businessSnap = await getDocs(businessQuery);
              const fetchedBusinesses: Business[] = businessSnap.docs.map((doc) => {
                const data = doc.data() as Omit<Business, "id">;
                return {
                  id: doc.id,
                  ...data,
                };
              });

              setBusinesses(fetchedBusinesses);

              const storedId = localStorage.getItem("activeBusinessId");
              const found = fetchedBusinesses.find((b) => b.id === storedId);
              setActiveBusinessState(found || fetchedBusinesses[0] || null);
            } else {
              setBusinesses([]);
              setActiveBusinessState(null);
            }
          } else {
            setRole(null);
            setBusinesses([]);
            setActiveBusinessState(null);
          }
        } catch (error) {
          console.error("Error loading user or businesses:", error);
          setRole(null);
          setBusinesses([]);
          setActiveBusinessState(null);
        }

        setLoading(false);
      } else {
        setUser(null);
        setRole(null);
        setBusinesses([]);
        setActiveBusinessState(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        role,
        businesses,
        activeBusiness,
        setActiveBusiness,
        loading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);