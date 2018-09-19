update() {
    git pull
}

start() {
    echo "Starting Yuki..."
    node src/main.js >> default.log 2>&1 &
    PID=$!
    echo $PID > "pid.txt"
    echo "Yuki started [pid: $PID]"
}

stop() {
    echo "Stopping Yuki..."
    if [ -f pid.txt ]; then
    	pid=$(head -n 1 "pid.txt")
    	kill $pid
    	rm pid.txt
    	echo "Yuki stopped [pid: $pid]"
    else
    	echo "No pid.txt file found."
    fi
}

if [ "$1" = "update" ]; then
    update
elif [ "$1" = "start" ]; then
    start
elif [ "$1" = "stop" ]; then
    stop
fi