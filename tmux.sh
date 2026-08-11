#!/usr/bin/env bash

ROOT="$(pwd)"

tmux new-window -n exec-fe -c "$ROOT/tasktracker"
tmux send-keys -t exec-fe 'npm run dev' C-m
tmux new-window -n code -c "$ROOT/tasktracker"
tmux send-keys -t code 'nvim' C-m
tmux new-window -n git
