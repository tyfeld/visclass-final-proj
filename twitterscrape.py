import twint

c = twint.Config()
c.Search = "#VIS2020"
c.Output = "VIS2020-full.csv"
#c.Store_csv = True
#c.Show_hashtags = True
c.Hide_output = True
#c.User_full = True
#c.Retweet = True
c.Store_object = True
twint.run.Search(c)


tweets = twint.output.tweets_list
users = []
for i in tweets:
    users.append(i[username])

print(users)