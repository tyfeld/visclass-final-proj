import twint  
import pandas as pd
df = pd.read_csv("VIS2020.csv")
usn = list(set(df["username"]))
#print(usn)
#dic = {}
c = twint.Config()
c.Username = usn[0]
c.Format = "ID {id} | Followers {followers}|Username {username}"
twint.run.Lookup(c)

# df2  = pd.DataFrame({"Username":usn})
# df2.to_csv("test3.csv")