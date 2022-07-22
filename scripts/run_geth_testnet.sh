
if [ -d "geth-data" ] 
then
    echo "Directory geth-data exists." 
else
    geth account new --datadir geth-data
fi

if [ -f "geth-data/genesis.json" ] 
then
    echo "Directory geth-data exists." 
else
    echo "create the genesis.json file"
    exit 0
fi

# Custom geth node
/home/brage/Downloads/go-ethereum/build/bin/geth --datadir geth-data --ws --config gethconfig.yaml --nodiscover --networkid 12345  --verbosity 6 --nodiscover --log.debug
