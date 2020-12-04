import twint

c = twint.Config()
#c.Username = "noneprivacy"
c.Search = "#VIS2019"
#c.Output = "VIS2019.csv"
#c.Store_csv = True
#c.Show_hashtags = True
#c.Hide_output = True
c.Limit = 20
twint.run.Search(c)