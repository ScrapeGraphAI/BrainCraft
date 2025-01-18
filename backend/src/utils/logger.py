import logging
import sys
from pathlib import Path
from logging.handlers import RotatingFileHandler
import colorama
from colorama import Fore, Style

# Initialize colorama for cross-platform colored output
colorama.init()

# Create logs directory if it doesn't exist
logs_dir = Path(__file__).parent.parent.parent / 'logs'
logs_dir.mkdir(exist_ok=True)

class ColoredFormatter(logging.Formatter):
    """Custom formatter with colors for terminal output"""
    
    COLORS = {
        'DEBUG': Fore.CYAN,
        'INFO': Fore.GREEN,
        'WARNING': Fore.YELLOW,
        'ERROR': Fore.RED,
        'CRITICAL': Fore.RED + Style.BRIGHT,
    }

    def format(self, record):
        # Add color to the level name if it's going to terminal
        if hasattr(record, 'color_enabled'):
            level_color = self.COLORS.get(record.levelname, '')
            record.levelname = f"{level_color}{record.levelname}{Style.RESET_ALL}"
        
        return super().format(record)

class TerminalHandler(logging.StreamHandler):
    """Custom handler for terminal output that enables color"""
    def emit(self, record):
        record.color_enabled = True
        super().emit(record)

def setup_logger(name: str) -> logging.Logger:
    logger = logging.getLogger(name)
    logger.setLevel(logging.DEBUG)

    # Clear any existing handlers
    logger.handlers = []

    # Create formatters
    detailed_formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    colored_formatter = ColoredFormatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )

    # Create console handler with colors
    console_handler = TerminalHandler(sys.stdout)
    console_handler.setLevel(logging.DEBUG)  # Show all logs in terminal
    console_handler.setFormatter(colored_formatter)

    # Create file handler
    file_handler = RotatingFileHandler(
        logs_dir / f'{name}.log',
        maxBytes=10*1024*1024,  # 10MB
        backupCount=5
    )
    file_handler.setLevel(logging.DEBUG)
    file_handler.setFormatter(detailed_formatter)

    # Add handlers
    logger.addHandler(console_handler)
    logger.addHandler(file_handler)

    return logger
