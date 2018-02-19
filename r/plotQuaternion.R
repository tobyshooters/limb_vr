# Read quaternion time series and plot by variable
require(data.table)

files <- list.files()
data <- lapply(files,function(x) read.csv(x))
testTable = data.table(data[[1]])
testTable[,run := 0]
testTable[,isLower := 1]
for (i in 2:20){
	appendTable = data.table(data[[i]])
	appendTable[,run := (i+1)%/%2]
	appendTable[,isLower := i%%2]
	testTable = rbindlist(list(testTable, appendTable))
}

data_rbind <- do.call("rbind", data)
require(data.table)
myoTable <- data.table(data_rbind)

myoTable <- testTable
myoTable[,isLower := fillerVec]
myoTable[,minTime := min(timestamp), by = run]
myoTable[,timeDiff := timestamp - minTime]


myoLowers = myoTable[isLower == 1,]
myoUppers = myoTable[isLower == 0,]
tsTest = myoLowers[1:501, orientation.w]
require(ggplot2)

ggplot(myoLowers,aes(x=timeDiff,y=orientation.w,colour=run,group=run)) + geom_line()
ggplot(myoUppers,aes(x=timeDiff,y=orientation.w,colour=run,group=run)) + geom_line()
ggplot(myoLowers,aes(x=timeDiff,y=orientation.x,colour=run,group=run)) + geom_line()
ggplot(myoUppers,aes(x=timeDiff,y=orientation.x,colour=run,group=run)) + geom_line()
ggplot(myoLowers,aes(x=timeDiff,y=orientation.y,colour=run,group=run)) + geom_line()
ggplot(myoUppers,aes(x=timeDiff,y=orientation.y,colour=run,group=run)) + geom_line()
ggplot(myoLowers,aes(x=timeDiff,y=orientation.z,colour=run,group=run)) + geom_line()
ggplot(myoUppers,aes(x=timeDiff,y=orientation.z,colour=run,group=run)) + geom_line()