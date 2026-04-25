#!/usr/bin/env bash

# Set magic variables for current file & dir
__dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
__root="$(cd "$(dirname "${__dir}")" && pwd)" # <-- change this
__file="${__dir}/$(basename "${BASH_SOURCE[0]}")"
__base="$(basename ${__file} .sh)"

function log() {
	echo "$(date +"%Y-%m-%d %H.%M.%S") - ${1}"
}

function main() {
	npm version --no-commit-hooks --no-git-tag-version $@
}

main $@
exit 0