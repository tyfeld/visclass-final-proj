import twint

c = twint.Config()
c.Search = "#VIS2019"
c.Output = "VIS2019.csv"
c.Store_csv = True
c.Show_hashtags = True
c.Hide_output = True
twint.run.Search(c)