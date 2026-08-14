#!/usr/bin/env bash

tmux new-window -n exec-fe
tmux send-keys -t exec-fe 'npm run dev' C-m
tmux new-window -n code
tmux send-keys -t code 'nvim' C-m
tmux new-window -n git
