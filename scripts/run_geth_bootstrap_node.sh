
if [ -d "geth-data" ] 
then
    echo "Directory geth-data exists." 
else
    echo "Please run run_geth_testnet.sh first"
    exit 0
fi


geth --datadir geth-data --networkid 12345 --nodiscover --verbosity 6 --nat extip:192.168.1.129
